/**
 * Integration Tests for Responses Routes
 * TDD approach: Tests written BEFORE implementation
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import {
  connectToDb,
  closeConnection,
  getDb,
} from '../../database_config/index.js';
import app from '../../app.js';

describe('Responses Routes', () => {
  let db;
  let testStudent;
  let otherStudent;
  let testQuestion;
  let authCookie;
  let otherAuthCookie;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'peer-tutor-connect-test';
    db = await connectToDb();
  });

  afterAll(async () => {
    await db.collection('students').deleteMany({});
    await db.collection('questions').deleteMany({});
    await db.collection('responses').deleteMany({});
    await closeConnection();
  });

  beforeEach(async () => {
    // Clear collections
    await db.collection('students').deleteMany({});
    await db.collection('questions').deleteMany({});
    await db.collection('responses').deleteMany({});

    // Create test students
    const hashedPassword = await bcrypt.hash('password123', 10);

    const student1Result = await db.collection('students').insertOne({
      firstName: 'Test',
      lastName: 'Student',
      universityEmail: 'test.student@stevens.edu',
      hashedPassword,
      major: 'Computer Science',
      age: 20,
      enrolledCourses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    testStudent = student1Result.insertedId;

    const student2Result = await db.collection('students').insertOne({
      firstName: 'Other',
      lastName: 'Student',
      universityEmail: 'other.student@stevens.edu',
      hashedPassword,
      major: 'Computer Science',
      age: 21,
      enrolledCourses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    otherStudent = student2Result.insertedId;

    // Create test question
    const questionResult = await db.collection('questions').insertOne({
      courseId: new ObjectId(),
      posterId: testStudent,
      title: 'Test Question',
      content: 'Test content',
      isAnonymous: false,
      isResolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    testQuestion = questionResult.insertedId;

    // Login both students
    const login1 = await request(app).post('/api/auth/login').send({
      universityEmail: 'test.student@stevens.edu',
      password: 'password123',
    });
    authCookie = login1.headers['set-cookie'];

    const login2 = await request(app).post('/api/auth/login').send({
      universityEmail: 'other.student@stevens.edu',
      password: 'password123',
    });
    otherAuthCookie = login2.headers['set-cookie'];
  });

  describe('POST /api/responses', () => {
    it('should create a response with valid data', async () => {
      const responseData = {
        questionId: testQuestion.toString(),
        content: 'Here is how you solve it...',
        isAnonymous: false,
      };

      const response = await request(app)
        .post('/api/responses')
        .set('Cookie', otherAuthCookie)
        .send(responseData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.response).toHaveProperty('_id');
      expect(response.body.response.content).toBe(responseData.content);
      expect(response.body.response.isHelpful).toBe(false);
    });

    it('should reject content exceeding 1500 characters', async () => {
      const response = await request(app)
        .post('/api/responses')
        .set('Cookie', otherAuthCookie)
        .send({
          questionId: testQuestion.toString(),
          content: 'a'.repeat(1501),
        });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/responses').send({
        questionId: testQuestion.toString(),
        content: 'Test',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/responses/:responseId', () => {
    let responseId;

    beforeEach(async () => {
      const result = await db.collection('responses').insertOne({
        questionId: testQuestion,
        posterId: otherStudent,
        content: 'Original content',
        isAnonymous: false,
        isHelpful: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      responseId = result.insertedId;
    });

    it('should update response by poster', async () => {
      const response = await request(app)
        .patch(`/api/responses/${responseId}`)
        .set('Cookie', otherAuthCookie)
        .send({
          content: 'Updated content',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response.content).toBe('Updated content');
    });

    it('should reject update by non-poster', async () => {
      const response = await request(app)
        .patch(`/api/responses/${responseId}`)
        .set('Cookie', authCookie)
        .send({ content: 'Hacked' });

      expect(response.status).toBe(403);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .patch(`/api/responses/${responseId}`)
        .send({ content: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/responses/:responseId', () => {
    let responseId;

    beforeEach(async () => {
      const result = await db.collection('responses').insertOne({
        questionId: testQuestion,
        posterId: otherStudent,
        content: 'To delete',
        isAnonymous: false,
        isHelpful: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      responseId = result.insertedId;
    });

    it('should delete response by poster', async () => {
      const response = await request(app)
        .delete(`/api/responses/${responseId}`)
        .set('Cookie', otherAuthCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion
      const found = await db
        .collection('responses')
        .findOne({ _id: responseId });
      expect(found).toBeNull();
    });

    it('should reject deletion by non-poster', async () => {
      const response = await request(app)
        .delete(`/api/responses/${responseId}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(403);
    });

    it('should require authentication', async () => {
      const response = await request(app).delete(
        `/api/responses/${responseId}`
      );

      expect(response.status).toBe(401);
    });
  });
});
