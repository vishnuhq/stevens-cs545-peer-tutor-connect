/**
 * Integration Tests for Courses Routes
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

describe('Courses Routes', () => {
  let db;
  let testStudent;
  let testCourses;
  let authCookie;

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

    // Create test courses
    const coursesResult = await db.collection('courses').insertMany([
      {
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
        enrolledStudents: [],
        createdAt: new Date(),
      },
      {
        courseCode: 'CS590',
        courseName: 'Algorithms',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. William Hendrix',
        instructorEmail: 'whendrix@stevens.edu',
        term: 'Fall 2025',
        enrolledStudents: [],
        createdAt: new Date(),
      },
      {
        courseCode: 'CS546',
        courseName: 'Web Programming',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Patrick Hill',
        instructorEmail: 'phill@stevens.edu',
        term: 'Fall 2025',
        enrolledStudents: [],
        createdAt: new Date(),
      },
    ]);

    const courseIds = Object.values(coursesResult.insertedIds);
    testCourses = courseIds;

    // Create test student enrolled in first 2 courses
    const hashedPassword = await bcrypt.hash('password123', 10);
    const enrolledCourses = [courseIds[0], courseIds[1]];

    const studentResult = await db.collection('students').insertOne({
      firstName: 'Test',
      lastName: 'Student',
      universityEmail: 'test.student@stevens.edu',
      hashedPassword,
      major: 'Computer Science',
      age: 20,
      enrolledCourses,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    testStudent = {
      _id: studentResult.insertedId,
      firstName: 'Test',
      lastName: 'Student',
      universityEmail: 'test.student@stevens.edu',
      enrolledCourses,
    };

    // Update courses with enrolled student
    for (const courseId of enrolledCourses) {
      await db
        .collection('courses')
        .updateOne(
          { _id: courseId },
          { $set: { enrolledStudents: [testStudent._id] } }
        );
    }

    // Login to get auth cookie
    const loginResponse = await request(app).post('/api/auth/login').send({
      universityEmail: 'test.student@stevens.edu',
      password: 'password123',
    });

    authCookie = loginResponse.headers['set-cookie'];
  });

  describe('GET /api/courses', () => {
    it('should return all courses the student is enrolled in', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.courses).toHaveLength(2);
      expect(response.body.courses[0]).toHaveProperty('courseCode');
      expect(response.body.courses[0]).toHaveProperty('courseName');
      expect(response.body.courses[0]).toHaveProperty('instructorName');

      // Should contain CS545 and CS590
      const courseCodes = response.body.courses.map((c) => c.courseCode);
      expect(courseCodes).toContain('CS545');
      expect(courseCodes).toContain('CS590');
      expect(courseCodes).not.toContain('CS546'); // Not enrolled in this
    });

    it('should return empty array if student not enrolled in any courses', async () => {
      // Create student with no courses
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.collection('students').insertOne({
        firstName: 'No',
        lastName: 'Courses',
        universityEmail: 'no.courses@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
        enrolledCourses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Login as this student
      const loginResponse = await request(app).post('/api/auth/login').send({
        universityEmail: 'no.courses@stevens.edu',
        password: 'password123',
      });

      const cookie = loginResponse.headers['set-cookie'];

      // Get courses
      const response = await request(app)
        .get('/api/courses')
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.courses).toEqual([]);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/courses');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(
        'Authentication required. Please log in.'
      );
    });

    it('should return courses with all required fields', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      const course = response.body.courses[0];
      expect(course).toHaveProperty('_id');
      expect(course).toHaveProperty('courseCode');
      expect(course).toHaveProperty('courseName');
      expect(course).toHaveProperty('section');
      expect(course).toHaveProperty('department');
      expect(course).toHaveProperty('instructorName');
      expect(course).toHaveProperty('instructorEmail');
      expect(course).toHaveProperty('term');
    });

    it('should include newQuestionCount for each course', async () => {
      // Clear any existing questions
      await db.collection('questions').deleteMany({});

      const now = new Date();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000);

      // Add 2 recent questions to CS545 (testCourses[0])
      await db.collection('questions').insertMany([
        {
          courseId: testCourses[0],
          posterId: testStudent._id,
          title: 'New Question 1',
          content: 'Content',
          isAnonymous: false,
          isResolved: false,
          createdAt: now,
          updatedAt: now,
        },
        {
          courseId: testCourses[0],
          posterId: testStudent._id,
          title: 'New Question 2',
          content: 'Content',
          isAnonymous: false,
          isResolved: false,
          createdAt: twelveHoursAgo,
          updatedAt: twelveHoursAgo,
        },
        // Old question - should NOT count
        {
          courseId: testCourses[0],
          posterId: testStudent._id,
          title: 'Old Question',
          content: 'Content',
          isAnonymous: false,
          isResolved: false,
          createdAt: thirtyHoursAgo,
          updatedAt: thirtyHoursAgo,
        },
      ]);

      const response = await request(app)
        .get('/api/courses')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Find CS545 course
      const cs545 = response.body.courses.find((c) => c.courseCode === 'CS545');
      const cs590 = response.body.courses.find((c) => c.courseCode === 'CS590');

      expect(cs545).toHaveProperty('newQuestionCount');
      expect(cs545.newQuestionCount).toBe(2); // 2 recent, not 3 (old excluded)
      expect(cs590).toHaveProperty('newQuestionCount');
      expect(cs590.newQuestionCount).toBe(0); // No questions

      // Clean up
      await db.collection('questions').deleteMany({});
    });

    it('should return 0 for courses with no new questions', async () => {
      // Ensure no questions exist
      await db.collection('questions').deleteMany({});

      const response = await request(app)
        .get('/api/courses')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      response.body.courses.forEach((course) => {
        expect(course.newQuestionCount).toBe(0);
      });
    });
  });
});
