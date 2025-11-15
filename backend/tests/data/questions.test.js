/**
 * Tests for Question Data Functions
 * TDD approach: Tests written BEFORE implementation
 */

import { jest } from '@jest/globals';
import { ObjectId } from 'mongodb';
import {
  connectToDb,
  closeConnection,
  getDb,
} from '../../database_config/index.js';
import {
  createQuestion,
  getQuestionById,
  getQuestionsByCourseId,
  updateQuestion,
  deleteQuestion,
} from '../../data/questions.js';

describe('Question Data Functions', () => {
  let db;
  const courseId = '507f1f77bcf86cd799439011';
  const posterId = '507f1f77bcf86cd799439012';

  beforeAll(async () => {
    process.env.DB_NAME = 'peer-tutor-connect-test';
    db = await connectToDb();
  });

  afterAll(async () => {
    await db.collection('questions').deleteMany({});
    await closeConnection();
  });

  beforeEach(async () => {
    await db.collection('questions').deleteMany({});
  });

  describe('createQuestion', () => {
    it('should create a new question with valid data', async () => {
      const questionData = {
        courseId,
        posterId,
        title: 'How do I implement binary search?',
        content: 'I am stuck on implementing binary search recursively.',
        isAnonymous: false,
      };

      const result = await createQuestion(questionData);

      expect(result).toHaveProperty('_id');
      expect(result.courseId.toString()).toBe(courseId);
      expect(result.posterId.toString()).toBe(posterId);
      expect(result.title).toBe('How do I implement binary search?');
      expect(result.content).toBe(
        'I am stuck on implementing binary search recursively.'
      );
      expect(result.isAnonymous).toBe(false);
      expect(result.isResolved).toBe(false);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should default isAnonymous to false', async () => {
      const questionData = {
        courseId,
        posterId,
        title: 'Test Question',
        content: 'Test content',
      };

      const result = await createQuestion(questionData);
      expect(result.isAnonymous).toBe(false);
    });

    it('should throw error if title exceeds 200 characters', async () => {
      const questionData = {
        courseId,
        posterId,
        title: 'a'.repeat(201),
        content: 'Test content',
      };

      await expect(createQuestion(questionData)).rejects.toThrow(
        'Title must not exceed 200 characters'
      );
    });

    it('should throw error if content exceeds 2000 characters', async () => {
      const questionData = {
        courseId,
        posterId,
        title: 'Test Question',
        content: 'a'.repeat(2001),
      };

      await expect(createQuestion(questionData)).rejects.toThrow(
        'Content must not exceed 2000 characters'
      );
    });

    it('should throw error for invalid courseId', async () => {
      const questionData = {
        courseId: 'invalid-id',
        posterId,
        title: 'Test Question',
        content: 'Test content',
      };

      await expect(createQuestion(questionData)).rejects.toThrow(
        'Invalid course ID'
      );
    });

    it('should trim whitespace from title and content', async () => {
      const questionData = {
        courseId,
        posterId,
        title: '  Test Question  ',
        content: '  Test content  ',
      };

      const result = await createQuestion(questionData);
      expect(result.title).toBe('Test Question');
      expect(result.content).toBe('Test content');
    });
  });

  describe('getQuestionById', () => {
    it('should return question if found', async () => {
      const created = await createQuestion({
        courseId,
        posterId,
        title: 'Test Question',
        content: 'Test content',
      });

      const question = await getQuestionById(created._id.toString());

      expect(question).not.toBeNull();
      expect(question.title).toBe('Test Question');
    });

    it('should return null if question not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const question = await getQuestionById(fakeId);
      expect(question).toBeNull();
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(getQuestionById('invalid-id')).rejects.toThrow(
        'Invalid question ID'
      );
    });
  });

  describe('getQuestionsByCourseId', () => {
    beforeEach(async () => {
      // Create test questions with different timestamps and resolved status
      const now = new Date();

      await db.collection('questions').insertOne({
        courseId: new ObjectId(courseId),
        posterId: new ObjectId(posterId),
        title: 'Question 1 - Newest',
        content: 'Content 1',
        isAnonymous: false,
        isResolved: false,
        createdAt: new Date(now.getTime()),
        updatedAt: new Date(now.getTime()),
      });

      await db.collection('questions').insertOne({
        courseId: new ObjectId(courseId),
        posterId: new ObjectId(posterId),
        title: 'Question 2 - Older Resolved',
        content: 'Content 2',
        isAnonymous: false,
        isResolved: true,
        createdAt: new Date(now.getTime() - 2000),
        updatedAt: new Date(now.getTime() - 2000),
      });

      await db.collection('questions').insertOne({
        courseId: new ObjectId(courseId),
        posterId: new ObjectId(posterId),
        title: 'Question 3 - Oldest',
        content: 'Content 3',
        isAnonymous: false,
        isResolved: false,
        createdAt: new Date(now.getTime() - 4000),
        updatedAt: new Date(now.getTime() - 4000),
      });
    });

    it('should return questions sorted by newest first (default)', async () => {
      const questions = await getQuestionsByCourseId(courseId, 'newest');

      expect(questions).toHaveLength(3);
      expect(questions[0].title).toBe('Question 1 - Newest');
      expect(questions[2].title).toBe('Question 3 - Oldest');
    });

    it('should return questions sorted by oldest first', async () => {
      const questions = await getQuestionsByCourseId(courseId, 'oldest');

      expect(questions).toHaveLength(3);
      expect(questions[0].title).toBe('Question 3 - Oldest');
      expect(questions[2].title).toBe('Question 1 - Newest');
    });

    it('should return only answered questions when sort is "answered"', async () => {
      const questions = await getQuestionsByCourseId(courseId, 'answered');

      expect(questions).toHaveLength(1);
      expect(questions[0].title).toBe('Question 2 - Older Resolved');
      expect(questions[0].isResolved).toBe(true);
    });

    it('should return only unanswered questions when sort is "unanswered"', async () => {
      const questions = await getQuestionsByCourseId(courseId, 'unanswered');

      expect(questions).toHaveLength(2);
      expect(questions.every((q) => !q.isResolved)).toBe(true);
    });

    it('should return empty array if no questions for course', async () => {
      const otherCourseId = '507f1f77bcf86cd799439099';
      const questions = await getQuestionsByCourseId(otherCourseId);
      expect(questions).toEqual([]);
    });

    it('should throw error for invalid courseId', async () => {
      await expect(getQuestionsByCourseId('invalid-id')).rejects.toThrow(
        'Invalid course ID'
      );
    });
  });

  describe('updateQuestion', () => {
    it('should update question fields', async () => {
      const created = await createQuestion({
        courseId,
        posterId,
        title: 'Original Title',
        content: 'Original content',
      });

      // Wait a moment to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updates = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const updated = await updateQuestion(created._id.toString(), updates);

      expect(updated.title).toBe('Updated Title');
      expect(updated.content).toBe('Updated content');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        created.updatedAt.getTime()
      );
    });

    it('should update isResolved status', async () => {
      const created = await createQuestion({
        courseId,
        posterId,
        title: 'Test Question',
        content: 'Test content',
      });

      const updated = await updateQuestion(created._id.toString(), {
        isResolved: true,
      });

      expect(updated.isResolved).toBe(true);
    });

    it('should throw error if title exceeds character limit', async () => {
      const created = await createQuestion({
        courseId,
        posterId,
        title: 'Test Question',
        content: 'Test content',
      });

      await expect(
        updateQuestion(created._id.toString(), { title: 'a'.repeat(201) })
      ).rejects.toThrow('Title must not exceed 200 characters');
    });

    it('should throw error for invalid question ID', async () => {
      await expect(updateQuestion('invalid-id', {})).rejects.toThrow(
        'Invalid question ID'
      );
    });

    it('should throw error if no updates provided', async () => {
      const created = await createQuestion({
        courseId,
        posterId,
        title: 'Test Question',
        content: 'Test content',
      });

      await expect(updateQuestion(created._id.toString(), {})).rejects.toThrow(
        'No updates provided'
      );
    });

    it('should throw error if question not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(updateQuestion(fakeId, { title: 'Test' })).rejects.toThrow(
        'Question not found'
      );
    });
  });

  describe('deleteQuestion', () => {
    it('should delete question successfully', async () => {
      const created = await createQuestion({
        courseId,
        posterId,
        title: 'Test Question',
        content: 'Test content',
      });

      const result = await deleteQuestion(created._id.toString());

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);

      const found = await getQuestionById(created._id.toString());
      expect(found).toBeNull();
    });

    it('should throw error for invalid question ID', async () => {
      await expect(deleteQuestion('invalid-id')).rejects.toThrow(
        'Invalid question ID'
      );
    });

    it('should throw error if question not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(deleteQuestion(fakeId)).rejects.toThrow(
        'Question not found'
      );
    });
  });
});
