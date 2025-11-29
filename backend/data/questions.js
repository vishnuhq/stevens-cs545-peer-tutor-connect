/**
 * Question Data Functions
 * CRUD operations for questions collection
 */

import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '../database_config/index.js';
import { validateString, isValidObjectId } from '../validation.js';

/**
 * Creates a new question in the database
 * @param {Object} questionData - Question information
 * @returns {Promise<Object>} Created question document
 * @throws {Error} If validation fails
 */
export const createQuestion = async (questionData) => {
  // Validate required fields
  const courseId = questionData.courseId;
  if (!isValidObjectId(courseId)) {
    throw new Error('Invalid course ID');
  }

  const posterId = questionData.posterId;
  if (!isValidObjectId(posterId)) {
    throw new Error('Invalid poster ID');
  }

  const title = validateString(questionData.title, 'Title', 1, 200);
  const content = validateString(questionData.content, 'Content', 1, 2000);

  const isAnonymous =
    questionData.isAnonymous !== undefined ? questionData.isAnonymous : false;

  if (typeof isAnonymous !== 'boolean') {
    throw new Error('isAnonymous must be a boolean');
  }

  // Create question document
  const newQuestion = {
    courseId: new ObjectId(courseId),
    posterId: new ObjectId(posterId),
    title,
    content,
    isAnonymous,
    isResolved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const questionsCollection = getCollection(COLLECTIONS.QUESTIONS);
  const result = await questionsCollection.insertOne(newQuestion);

  if (!result.acknowledged) {
    throw new Error('Failed to create question');
  }

  return {
    _id: result.insertedId,
    ...newQuestion,
  };
};

/**
 * Gets a question by ID
 * @param {string} questionId - Question ObjectId
 * @returns {Promise<Object|null>} Question document or null
 * @throws {Error} If ID is invalid
 */
export const getQuestionById = async (questionId) => {
  if (!isValidObjectId(questionId)) {
    throw new Error('Invalid question ID');
  }

  const questionsCollection = getCollection(COLLECTIONS.QUESTIONS);

  // Use aggregation to populate poster information
  const questions = await questionsCollection
    .aggregate([
      { $match: { _id: new ObjectId(questionId) } },
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
    ])
    .toArray();

  return questions.length > 0 ? questions[0] : null;
};

/**
 * Gets all questions for a course with sorting
 * @param {string} courseId - Course ObjectId
 * @param {string} sortOption - Sort option: 'newest', 'oldest', 'answered', 'unanswered'
 * @returns {Promise<Array>} Array of question documents
 * @throws {Error} If courseId is invalid
 */
export const getQuestionsByCourseId = async (
  courseId,
  sortOption = 'newest'
) => {
  if (!isValidObjectId(courseId)) {
    throw new Error('Invalid course ID');
  }

  const questionsCollection = getCollection(COLLECTIONS.QUESTIONS);

  let matchStage = { courseId: new ObjectId(courseId) };
  let sortStage = {};

  switch (sortOption) {
    case 'newest':
      sortStage = { createdAt: -1 };
      break;
    case 'oldest':
      sortStage = { createdAt: 1 };
      break;
    case 'answered':
      matchStage.isResolved = true;
      sortStage = { createdAt: -1 };
      break;
    case 'unanswered':
      matchStage.isResolved = false;
      sortStage = { createdAt: -1 };
      break;
    default:
      sortStage = { createdAt: -1 };
  }

  // Use aggregation to populate poster information
  const questions = await questionsCollection
    .aggregate([
      { $match: matchStage },
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

  return questions;
};

/**
 * Updates a question
 * @param {string} questionId - Question ObjectId
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated question document
 * @throws {Error} If ID is invalid or update fails
 */
export const updateQuestion = async (questionId, updates) => {
  if (!isValidObjectId(questionId)) {
    throw new Error('Invalid question ID');
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('No updates provided');
  }

  const allowedUpdates = ['title', 'content', 'isResolved'];
  const updateFields = {};

  // Validate and process each update field
  for (const [key, value] of Object.entries(updates)) {
    if (!allowedUpdates.includes(key)) {
      throw new Error(`Cannot update field: ${key}`);
    }

    if (key === 'title') {
      updateFields[key] = validateString(value, 'Title', 1, 200);
    } else if (key === 'content') {
      updateFields[key] = validateString(value, 'Content', 1, 2000);
    } else if (key === 'isResolved') {
      if (typeof value !== 'boolean') {
        throw new Error('isResolved must be a boolean');
      }
      updateFields[key] = value;
    }
  }

  updateFields.updatedAt = new Date();

  const questionsCollection = getCollection(COLLECTIONS.QUESTIONS);
  const result = await questionsCollection.findOneAndUpdate(
    { _id: new ObjectId(questionId) },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error('Question not found');
  }

  return result;
};

/**
 * Deletes a question
 * @param {string} questionId - Question ObjectId
 * @returns {Promise<Object>} Deletion result
 * @throws {Error} If ID is invalid or deletion fails
 */
export const deleteQuestion = async (questionId) => {
  if (!isValidObjectId(questionId)) {
    throw new Error('Invalid question ID');
  }

  const questionsCollection = getCollection(COLLECTIONS.QUESTIONS);
  const result = await questionsCollection.deleteOne({
    _id: new ObjectId(questionId),
  });

  if (result.deletedCount === 0) {
    throw new Error('Question not found');
  }

  return { success: true, deletedCount: result.deletedCount };
};
