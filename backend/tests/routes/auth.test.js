/**
 * Integration Tests for Authentication Routes
 * TDD approach: Tests written BEFORE implementation
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';
import {
  connectToDb,
  closeConnection,
  getDb,
} from '../../database_config/index.js';
import app from '../../app.js';

describe('Authentication Routes', () => {
  let db;
  let testStudent;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'peer-tutor-connect-test';
    db = await connectToDb();
  });

  afterAll(async () => {
    await db.collection('students').deleteMany({});
    await closeConnection();
  });

  beforeEach(async () => {
    // Clear students collection
    await db.collection('students').deleteMany({});

    // Create a test student
    const hashedPassword = await bcrypt.hash('password123', 10);
    const result = await db.collection('students').insertOne({
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

    testStudent = {
      _id: result.insertedId,
      firstName: 'Test',
      lastName: 'Student',
      universityEmail: 'test.student@stevens.edu',
    };
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        universityEmail: 'test.student@stevens.edu',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.student).toHaveProperty('id');
      expect(response.body.student.firstName).toBe('Test');
      expect(response.body.student.lastName).toBe('Student');
      expect(response.body.student.email).toBe('test.student@stevens.edu');
      expect(response.body.student).not.toHaveProperty('hashedPassword');

      // Should set session cookie
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should be case-insensitive for email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        universityEmail: 'TEST.STUDENT@STEVENS.EDU',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        universityEmail: 'nonexistent@stevens.edu',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        universityEmail: 'test.student@stevens.edu',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app).post('/api/auth/login').send({
        universityEmail: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail with non-Stevens email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        universityEmail: 'test@gmail.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with missing password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        universityEmail: 'test.student@stevens.edu',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with empty password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        universityEmail: 'test.student@stevens.edu',
        password: '   ',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully when authenticated', async () => {
      // First login
      const loginResponse = await request(app).post('/api/auth/login').send({
        universityEmail: 'test.student@stevens.edu',
        password: 'password123',
      });

      const cookies = loginResponse.headers['set-cookie'];

      // Then logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);
      expect(logoutResponse.body.message).toBe('Logged out successfully');
    });

    it('should fail when not authenticated', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(
        'Authentication required. Please log in.'
      );
    });
  });

  describe('GET /api/auth/check', () => {
    it('should return logged in status when authenticated', async () => {
      // First login
      const loginResponse = await request(app).post('/api/auth/login').send({
        universityEmail: 'test.student@stevens.edu',
        password: 'password123',
      });

      const cookies = loginResponse.headers['set-cookie'];

      // Then check auth status
      const checkResponse = await request(app)
        .get('/api/auth/check')
        .set('Cookie', cookies);

      expect(checkResponse.status).toBe(200);
      expect(checkResponse.body.loggedIn).toBe(true);
      expect(checkResponse.body.student).toHaveProperty('id');
      expect(checkResponse.body.student.firstName).toBe('Test');
      expect(checkResponse.body.student.email).toBe('test.student@stevens.edu');
    });

    it('should return not logged in when no session', async () => {
      const response = await request(app).get('/api/auth/check');

      expect(response.status).toBe(200);
      expect(response.body.loggedIn).toBe(false);
      expect(response.body.student).toBeUndefined();
    });

    it('should return not logged in after logout', async () => {
      // Login
      const loginResponse = await request(app).post('/api/auth/login').send({
        universityEmail: 'test.student@stevens.edu',
        password: 'password123',
      });

      const cookies = loginResponse.headers['set-cookie'];

      // Logout
      await request(app).post('/api/auth/logout').set('Cookie', cookies);

      // Check status (with old cookies)
      const checkResponse = await request(app)
        .get('/api/auth/check')
        .set('Cookie', cookies);

      expect(checkResponse.status).toBe(200);
      expect(checkResponse.body.loggedIn).toBe(false);
    });
  });
});
