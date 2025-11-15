/**
 * Tests for Response Data Functions
 * TDD approach: Tests written BEFORE implementation
 */

import { jest } from '@jest/globals';
import {
  connectToDb,
  closeConnection,
  getDb,
} from '../../database_config/index.js';
import {
  createResponse,
  getResponseById,
  getResponsesByQuestionId,
  updateResponse,
  deleteResponse,
} from '../../data/responses.js';

describe('Response Data Functions', () => {
  let db;
  const questionId = '507f1f77bcf86cd799439011';
  const posterId = '507f1f77bcf86cd799439012';

  beforeAll(async () => {
    process.env.DB_NAME = 'peer-tutor-connect-test';
    db = await connectToDb();
  });

  afterAll(async () => {
    await db.collection('responses').deleteMany({});
    await closeConnection();
  });

  beforeEach(async () => {
    await db.collection('responses').deleteMany({});
  });

  describe('createResponse', () => {
    it('should create a new response with valid data', async () => {
      const responseData = {
        questionId,
        posterId,
        content: 'Here is how you implement binary search...',
        isAnonymous: false,
      };

      const result = await createResponse(responseData);

      expect(result).toHaveProperty('_id');
      expect(result.questionId.toString()).toBe(questionId);
      expect(result.posterId.toString()).toBe(posterId);
      expect(result.content).toBe('Here is how you implement binary search...');
      expect(result.isAnonymous).toBe(false);
      expect(result.isHelpful).toBe(false);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should default isAnonymous to false', async () => {
      const responseData = {
        questionId,
        posterId,
        content: 'Test response',
      };

      const result = await createResponse(responseData);
      expect(result.isAnonymous).toBe(false);
    });

    it('should throw error if content exceeds 1500 characters', async () => {
      const responseData = {
        questionId,
        posterId,
        content: 'a'.repeat(1501),
      };

      await expect(createResponse(responseData)).rejects.toThrow(
        'Content must not exceed 1500 characters'
      );
    });

    it('should throw error for invalid questionId', async () => {
      const responseData = {
        questionId: 'invalid-id',
        posterId,
        content: 'Test response',
      };

      await expect(createResponse(responseData)).rejects.toThrow(
        'Invalid question ID'
      );
    });

    it('should throw error for invalid posterId', async () => {
      const responseData = {
        questionId,
        posterId: 'invalid-id',
        content: 'Test response',
      };

      await expect(createResponse(responseData)).rejects.toThrow(
        'Invalid poster ID'
      );
    });

    it('should trim whitespace from content', async () => {
      const responseData = {
        questionId,
        posterId,
        content: '  Test response  ',
      };

      const result = await createResponse(responseData);
      expect(result.content).toBe('Test response');
    });
  });

  describe('getResponseById', () => {
    it('should return response if found', async () => {
      const created = await createResponse({
        questionId,
        posterId,
        content: 'Test response',
      });

      const response = await getResponseById(created._id.toString());

      expect(response).not.toBeNull();
      expect(response.content).toBe('Test response');
    });

    it('should return null if response not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await getResponseById(fakeId);
      expect(response).toBeNull();
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(getResponseById('invalid-id')).rejects.toThrow(
        'Invalid response ID'
      );
    });
  });

  describe('getResponsesByQuestionId', () => {
    beforeEach(async () => {
      const now = new Date();

      await db.collection('responses').insertOne({
        questionId: new ObjectId(questionId),
        posterId: new ObjectId(posterId),
        content: 'Response 1 - Newest',
        isAnonymous: false,
        isHelpful: false,
        createdAt: new Date(now.getTime()),
        updatedAt: new Date(now.getTime()),
      });

      await db.collection('responses').insertOne({
        questionId: new ObjectId(questionId),
        posterId: new ObjectId(posterId),
        content: 'Response 2 - Middle',
        isAnonymous: false,
        isHelpful: true,
        createdAt: new Date(now.getTime() - 2000),
        updatedAt: new Date(now.getTime() - 2000),
      });

      await db.collection('responses').insertOne({
        questionId: new ObjectId(questionId),
        posterId: new ObjectId(posterId),
        content: 'Response 3 - Oldest',
        isAnonymous: false,
        isHelpful: false,
        createdAt: new Date(now.getTime() - 4000),
        updatedAt: new Date(now.getTime() - 4000),
      });
    });

    it('should return responses sorted by newest first (default)', async () => {
      const responses = await getResponsesByQuestionId(questionId, 'newest');

      expect(responses).toHaveLength(3);
      expect(responses[0].content).toBe('Response 1 - Newest');
      expect(responses[2].content).toBe('Response 3 - Oldest');
    });

    it('should return responses sorted by oldest first', async () => {
      const responses = await getResponsesByQuestionId(questionId, 'oldest');

      expect(responses).toHaveLength(3);
      expect(responses[0].content).toBe('Response 3 - Oldest');
      expect(responses[2].content).toBe('Response 1 - Newest');
    });

    it('should return empty array if no responses for question', async () => {
      const otherQuestionId = '507f1f77bcf86cd799439099';
      const responses = await getResponsesByQuestionId(otherQuestionId);
      expect(responses).toEqual([]);
    });

    it('should throw error for invalid questionId', async () => {
      await expect(getResponsesByQuestionId('invalid-id')).rejects.toThrow(
        'Invalid question ID'
      );
    });
  });

  describe('updateResponse', () => {
    it('should update response content', async () => {
      const created = await createResponse({
        questionId,
        posterId,
        content: 'Original content',
      });

      // Wait a moment to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updates = {
        content: 'Updated content',
      };

      const updated = await updateResponse(created._id.toString(), updates);

      expect(updated.content).toBe('Updated content');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        created.updatedAt.getTime()
      );
    });

    it('should update isHelpful status', async () => {
      const created = await createResponse({
        questionId,
        posterId,
        content: 'Test response',
      });

      const updated = await updateResponse(created._id.toString(), {
        isHelpful: true,
      });

      expect(updated.isHelpful).toBe(true);
    });

    it('should throw error if content exceeds character limit', async () => {
      const created = await createResponse({
        questionId,
        posterId,
        content: 'Test response',
      });

      await expect(
        updateResponse(created._id.toString(), { content: 'a'.repeat(1501) })
      ).rejects.toThrow('Content must not exceed 1500 characters');
    });

    it('should throw error for invalid response ID', async () => {
      await expect(updateResponse('invalid-id', {})).rejects.toThrow(
        'Invalid response ID'
      );
    });

    it('should throw error if no updates provided', async () => {
      const created = await createResponse({
        questionId,
        posterId,
        content: 'Test response',
      });

      await expect(updateResponse(created._id.toString(), {})).rejects.toThrow(
        'No updates provided'
      );
    });

    it('should throw error if response not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(updateResponse(fakeId, { content: 'Test' })).rejects.toThrow(
        'Response not found'
      );
    });
  });

  describe('deleteResponse', () => {
    it('should delete response successfully', async () => {
      const created = await createResponse({
        questionId,
        posterId,
        content: 'Test response',
      });

      const result = await deleteResponse(created._id.toString());

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);

      const found = await getResponseById(created._id.toString());
      expect(found).toBeNull();
    });

    it('should throw error for invalid response ID', async () => {
      await expect(deleteResponse('invalid-id')).rejects.toThrow(
        'Invalid response ID'
      );
    });

    it('should throw error if response not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(deleteResponse(fakeId)).rejects.toThrow(
        'Response not found'
      );
    });
  });
});

// Import ObjectId for tests
import { ObjectId } from 'mongodb';
