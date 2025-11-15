/**
 * Integration Tests for Questions Routes
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

describe('Questions Routes', () => {
  let db;
  let testStudent;
  let otherStudent;
  let testCourse;
  let authCookie;
  let otherAuthCookie;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'peer-tutor-connect-test';
    db = await connectToDb();
  });

  afterAll(async () => {
    await db.collection('students').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('questions').deleteMany({});
    await closeConnection();
  });

  beforeEach(async () => {
    // Clear collections
    await db.collection('students').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('questions').deleteMany({});

    // Create test course
    const courseResult = await db.collection('courses').insertOne({
      courseCode: 'CS545',
      courseName: 'Human Computer Interaction',
      section: 'WS',
      department: 'Computer Science',
      instructorName: 'Dr. Gregg Vesonder',
      instructorEmail: 'gvesonde@stevens.edu',
      term: 'Fall 2025',
      enrolledStudents: [],
      createdAt: new Date(),
    });
    testCourse = courseResult.insertedId;

    // Create test students
    const hashedPassword = await bcrypt.hash('password123', 10);

    const student1Result = await db.collection('students').insertOne({
      firstName: 'Test',
      lastName: 'Student',
      universityEmail: 'test.student@stevens.edu',
      hashedPassword,
      major: 'Computer Science',
      age: 20,
      enrolledCourses: [testCourse],
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
      enrolledCourses: [testCourse],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    otherStudent = student2Result.insertedId;

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

  describe('GET /api/questions/:courseId', () => {
    beforeEach(async () => {
      const now = new Date();
      // Create test questions with different timestamps and resolved status
      await db.collection('questions').insertMany([
        {
          courseId: testCourse,
          posterId: testStudent,
          title: 'Question 1 - Newest',
          content: 'Content 1',
          isAnonymous: false,
          isResolved: false,
          createdAt: new Date(now.getTime()),
          updatedAt: new Date(now.getTime()),
        },
        {
          courseId: testCourse,
          posterId: testStudent,
          title: 'Question 2 - Resolved',
          content: 'Content 2',
          isAnonymous: false,
          isResolved: true,
          createdAt: new Date(now.getTime() - 2000),
          updatedAt: new Date(now.getTime() - 2000),
        },
        {
          courseId: testCourse,
          posterId: otherStudent,
          title: 'Question 3 - Oldest',
          content: 'Content 3',
          isAnonymous: true,
          isResolved: false,
          createdAt: new Date(now.getTime() - 4000),
          updatedAt: new Date(now.getTime() - 4000),
        },
      ]);
    });

    it('should return questions sorted by newest first (default)', async () => {
      const response = await request(app)
        .get(`/api/questions/${testCourse}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.questions).toHaveLength(3);
      expect(response.body.questions[0].title).toBe('Question 1 - Newest');
      expect(response.body.questions[2].title).toBe('Question 3 - Oldest');
    });

    it('should return questions sorted by oldest first', async () => {
      const response = await request(app)
        .get(`/api/questions/${testCourse}?sort=oldest`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.questions[0].title).toBe('Question 3 - Oldest');
      expect(response.body.questions[2].title).toBe('Question 1 - Newest');
    });

    it('should return only answered questions', async () => {
      const response = await request(app)
        .get(`/api/questions/${testCourse}?sort=answered`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.questions).toHaveLength(1);
      expect(response.body.questions[0].isResolved).toBe(true);
    });

    it('should return only unanswered questions', async () => {
      const response = await request(app)
        .get(`/api/questions/${testCourse}?sort=unanswered`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.questions).toHaveLength(2);
      expect(response.body.questions.every((q) => !q.isResolved)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app).get(`/api/questions/${testCourse}`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/questions', () => {
    it('should create a question with valid data', async () => {
      const questionData = {
        courseId: testCourse.toString(),
        title: 'How do I implement binary search?',
        content: 'I am stuck on the recursive implementation.',
        isAnonymous: false,
      };

      const response = await request(app)
        .post('/api/questions')
        .set('Cookie', authCookie)
        .send(questionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.question).toHaveProperty('_id');
      expect(response.body.question.title).toBe(questionData.title);
      expect(response.body.question.isResolved).toBe(false);
    });

    it('should reject title exceeding 200 characters', async () => {
      const response = await request(app)
        .post('/api/questions')
        .set('Cookie', authCookie)
        .send({
          courseId: testCourse.toString(),
          title: 'a'.repeat(201),
          content: 'Test content',
        });

      expect(response.status).toBe(400);
    });

    it('should reject content exceeding 2000 characters', async () => {
      const response = await request(app)
        .post('/api/questions')
        .set('Cookie', authCookie)
        .send({
          courseId: testCourse.toString(),
          title: 'Test question',
          content: 'a'.repeat(2001),
        });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/questions').send({
        courseId: testCourse.toString(),
        title: 'Test',
        content: 'Test',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/questions/:questionId', () => {
    let questionId;

    beforeEach(async () => {
      const result = await db.collection('questions').insertOne({
        courseId: testCourse,
        posterId: testStudent,
        title: 'Original Title',
        content: 'Original content',
        isAnonymous: false,
        isResolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      questionId = result.insertedId;
    });

    it('should update question by poster', async () => {
      const response = await request(app)
        .patch(`/api/questions/${questionId}`)
        .set('Cookie', authCookie)
        .send({
          title: 'Updated Title',
          content: 'Updated content',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.question.title).toBe('Updated Title');
    });

    it('should allow marking as resolved', async () => {
      const response = await request(app)
        .patch(`/api/questions/${questionId}`)
        .set('Cookie', authCookie)
        .send({ isResolved: true });

      expect(response.status).toBe(200);
      expect(response.body.question.isResolved).toBe(true);
    });

    it('should reject update by non-poster', async () => {
      const response = await request(app)
        .patch(`/api/questions/${questionId}`)
        .set('Cookie', otherAuthCookie)
        .send({ title: 'Hacked' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('You can only edit your own questions');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .patch(`/api/questions/${questionId}`)
        .send({ title: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/questions/:questionId', () => {
    let questionId;

    beforeEach(async () => {
      const result = await db.collection('questions').insertOne({
        courseId: testCourse,
        posterId: testStudent,
        title: 'To Delete',
        content: 'Content',
        isAnonymous: false,
        isResolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      questionId = result.insertedId;
    });

    it('should delete question by poster', async () => {
      const response = await request(app)
        .delete(`/api/questions/${questionId}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion
      const found = await db
        .collection('questions')
        .findOne({ _id: questionId });
      expect(found).toBeNull();
    });

    it('should reject deletion by non-poster', async () => {
      const response = await request(app)
        .delete(`/api/questions/${questionId}`)
        .set('Cookie', otherAuthCookie);

      expect(response.status).toBe(403);
    });

    it('should require authentication', async () => {
      const response = await request(app).delete(
        `/api/questions/${questionId}`
      );

      expect(response.status).toBe(401);
    });
  });
});
