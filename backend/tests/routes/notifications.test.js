/**
 * Integration Tests for Notifications Routes
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

describe('Notifications Routes', () => {
  let db;
  let testStudent;
  let authCookie;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'peer-tutor-connect-test';
    db = await connectToDb();
  });

  afterAll(async () => {
    await db.collection('students').deleteMany({});
    await db.collection('notifications').deleteMany({});
    await closeConnection();
  });

  beforeEach(async () => {
    // Clear collections
    await db.collection('students').deleteMany({});
    await db.collection('notifications').deleteMany({});

    // Create test student
    const hashedPassword = await bcrypt.hash('password123', 10);

    const studentResult = await db.collection('students').insertOne({
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
    testStudent = studentResult.insertedId;

    // Create test notifications
    await db.collection('notifications').insertMany([
      {
        recipientId: testStudent,
        questionId: new ObjectId(),
        senderId: new ObjectId(),
        type: 'new_response',
        message: 'Someone replied to your question',
        isRead: false,
        createdAt: new Date(),
      },
      {
        recipientId: testStudent,
        questionId: new ObjectId(),
        senderId: new ObjectId(),
        type: 'new_response',
        message: 'Another reply',
        isRead: false,
        createdAt: new Date(Date.now() - 1000),
      },
      {
        recipientId: testStudent,
        questionId: new ObjectId(),
        senderId: new ObjectId(),
        type: 'new_response',
        message: 'Old notification',
        isRead: true,
        createdAt: new Date(Date.now() - 2000),
      },
    ]);

    // Login
    const loginResponse = await request(app).post('/api/auth/login').send({
      universityEmail: 'test.student@stevens.edu',
      password: 'password123',
    });
    authCookie = loginResponse.headers['set-cookie'];
  });

  describe('GET /api/notifications', () => {
    it('should return unread notifications by default', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.notifications).toHaveLength(2);
      expect(response.body.notifications.every((n) => !n.isRead)).toBe(true);
    });

    it('should return all notifications when unreadOnly=false', async () => {
      const response = await request(app)
        .get('/api/notifications?unreadOnly=false')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.notifications).toHaveLength(3);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/notifications');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/notifications/:notificationId/read', () => {
    let notificationId;

    beforeEach(async () => {
      const result = await db.collection('notifications').insertOne({
        recipientId: testStudent,
        questionId: new ObjectId(),
        senderId: new ObjectId(),
        type: 'new_response',
        message: 'Test notification',
        isRead: false,
        createdAt: new Date(),
      });
      notificationId = result.insertedId;
    });

    it('should mark notification as read', async () => {
      const response = await request(app)
        .patch(`/api/notifications/${notificationId}/read`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify marked as read
      const notification = await db
        .collection('notifications')
        .findOne({ _id: notificationId });
      expect(notification.isRead).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app).patch(
        `/api/notifications/${notificationId}/read`
      );

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .patch('/api/notifications/read-all')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify all marked as read
      const unreadCount = await db.collection('notifications').countDocuments({
        recipientId: testStudent,
        isRead: false,
      });
      expect(unreadCount).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await request(app).patch('/api/notifications/read-all');

      expect(response.status).toBe(401);
    });
  });
});
