/**
 * Response Data Functions
 * CRUD operations for responses collection
 */

import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '../database_config/index.js';
import { validateString, isValidObjectId } from '../validation.js';

/**
 * Creates a new response in the database
 * @param {Object} responseData - Response information
 * @returns {Promise<Object>} Created response document
 * @throws {Error} If validation fails
 */
export const createResponse = async (responseData) => {
  // Validate required fields
  const questionId = responseData.questionId;
  if (!isValidObjectId(questionId)) {
    throw new Error('Invalid question ID');
  }

  const posterId = responseData.posterId;
  if (!isValidObjectId(posterId)) {
    throw new Error('Invalid poster ID');
  }

  const content = validateString(responseData.content, 'Content', 1, 1500);

  const isAnonymous =
    responseData.isAnonymous !== undefined ? responseData.isAnonymous : false;

  if (typeof isAnonymous !== 'boolean') {
    throw new Error('isAnonymous must be a boolean');
  }

  // Create response document
  const newResponse = {
    questionId: new ObjectId(questionId),
    posterId: new ObjectId(posterId),
    content,
    isAnonymous,
    isHelpful: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const responsesCollection = getCollection(COLLECTIONS.RESPONSES);
  const result = await responsesCollection.insertOne(newResponse);

  if (!result.acknowledged) {
    throw new Error('Failed to create response');
  }

  return {
    _id: result.insertedId,
    ...newResponse,
  };
};

/**
 * Gets a response by ID
 * @param {string} responseId - Response ObjectId
 * @returns {Promise<Object|null>} Response document or null
 * @throws {Error} If ID is invalid
 */
export const getResponseById = async (responseId) => {
  if (!isValidObjectId(responseId)) {
    throw new Error('Invalid response ID');
  }

  const responsesCollection = getCollection(COLLECTIONS.RESPONSES);
  const response = await responsesCollection.findOne({
    _id: new ObjectId(responseId),
  });

  return response;
};

/**
 * Gets all responses for a question with sorting
 * @param {string} questionId - Question ObjectId
 * @param {string} sortOption - Sort option: 'newest', 'oldest'
 * @returns {Promise<Array>} Array of response documents
 * @throws {Error} If questionId is invalid
 */
export const getResponsesByQuestionId = async (
  questionId,
  sortOption = 'newest'
) => {
  if (!isValidObjectId(questionId)) {
    throw new Error('Invalid question ID');
  }

  const responsesCollection = getCollection(COLLECTIONS.RESPONSES);

  let sortStage = {};

  switch (sortOption) {
    case 'newest':
      sortStage = { createdAt: -1 };
      break;
    case 'oldest':
      sortStage = { createdAt: 1 };
      break;
    default:
      sortStage = { createdAt: -1 };
  }

  // Use aggregation to populate poster information
  const responses = await responsesCollection
    .aggregate([
      { $match: { questionId: new ObjectId(questionId) } },
      {
        $lookup: {
          from: 'students',
          localField: 'posterId',
          foreignField: '_id',
          as: 'poster',
        },
      },
      {
        $addFields: {
          posterName: {
            $cond: {
              if: '$isAnonymous',
              then: 'Anonymous',
              else: {
                $concat: [
                  { $arrayElemAt: ['$poster.firstName', 0] },
                  ' ',
                  { $arrayElemAt: ['$poster.lastName', 0] },
                ],
              },
            },
          },
        },
      },
      { $project: { poster: 0 } }, // Remove full poster object
      { $sort: sortStage },
    ])
    .toArray();

  return responses;
};

/**
 * Updates a response
 * @param {string} responseId - Response ObjectId
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated response document
 * @throws {Error} If ID is invalid or update fails
 */
export const updateResponse = async (responseId, updates) => {
  if (!isValidObjectId(responseId)) {
    throw new Error('Invalid response ID');
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('No updates provided');
  }

  const allowedUpdates = ['content', 'isHelpful'];
  const updateFields = {};

  // Validate and process each update field
  for (const [key, value] of Object.entries(updates)) {
    if (!allowedUpdates.includes(key)) {
      throw new Error(`Cannot update field: ${key}`);
    }

    if (key === 'content') {
      updateFields[key] = validateString(value, 'Content', 1, 1500);
    } else if (key === 'isHelpful') {
      if (typeof value !== 'boolean') {
        throw new Error('isHelpful must be a boolean');
      }
      updateFields[key] = value;
    }
  }

  updateFields.updatedAt = new Date();

  const responsesCollection = getCollection(COLLECTIONS.RESPONSES);
  const result = await responsesCollection.findOneAndUpdate(
    { _id: new ObjectId(responseId) },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error('Response not found');
  }

  return result;
};

/**
 * Deletes a response
 * @param {string} responseId - Response ObjectId
 * @returns {Promise<Object>} Deletion result
 * @throws {Error} If ID is invalid or deletion fails
 */
export const deleteResponse = async (responseId) => {
  if (!isValidObjectId(responseId)) {
    throw new Error('Invalid response ID');
  }

  const responsesCollection = getCollection(COLLECTIONS.RESPONSES);
  const result = await responsesCollection.deleteOne({
    _id: new ObjectId(responseId),
  });

  if (result.deletedCount === 0) {
    throw new Error('Response not found');
  }

  return { success: true, deletedCount: result.deletedCount };
};

/**
 * Deletes all responses for a question (cascade delete)
 * @param {string} questionId - Question ObjectId
 * @returns {Promise<Object>} Deletion result with count
 * @throws {Error} If questionId is invalid
 */
export const deleteResponsesByQuestionId = async (questionId) => {
  if (!isValidObjectId(questionId)) {
    throw new Error('Invalid question ID');
  }

  const responsesCollection = getCollection(COLLECTIONS.RESPONSES);
  const result = await responsesCollection.deleteMany({
    questionId: new ObjectId(questionId),
  });

  return { success: true, deletedCount: result.deletedCount };
};
