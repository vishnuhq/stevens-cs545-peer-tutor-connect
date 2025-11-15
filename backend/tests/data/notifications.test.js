/**
 * Tests for Notification Data Functions
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
  createNotification,
  getNotificationById,
  getNotificationsByStudentId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification,
} from '../../data/notifications.js';

describe('Notification Data Functions', () => {
  let db;
  const recipientId = '507f1f77bcf86cd799439011';
  const senderId = '507f1f77bcf86cd799439012';
  const questionId = '507f1f77bcf86cd799439013';

  beforeAll(async () => {
    process.env.DB_NAME = 'peer-tutor-connect-test';
    db = await connectToDb();
  });

  afterAll(async () => {
    await db.collection('notifications').deleteMany({});
    await closeConnection();
  });

  beforeEach(async () => {
    await db.collection('notifications').deleteMany({});
  });

  describe('createNotification', () => {
    it('should create a new notification with valid data', async () => {
      const notificationData = {
        recipientId,
        questionId,
        senderId,
        type: 'new_response',
        message: 'John replied to your question',
      };

      const result = await createNotification(notificationData);

      expect(result).toHaveProperty('_id');
      expect(result.recipientId.toString()).toBe(recipientId);
      expect(result.questionId.toString()).toBe(questionId);
      expect(result.senderId.toString()).toBe(senderId);
      expect(result.type).toBe('new_response');
      expect(result.message).toBe('John replied to your question');
      expect(result.isRead).toBe(false);
      expect(result).toHaveProperty('createdAt');
    });

    it('should throw error for invalid recipientId', async () => {
      const notificationData = {
        recipientId: 'invalid-id',
        questionId,
        senderId,
        type: 'new_response',
        message: 'Test message',
      };

      await expect(createNotification(notificationData)).rejects.toThrow(
        'Invalid recipient ID'
      );
    });

    it('should throw error if message is empty', async () => {
      const notificationData = {
        recipientId,
        questionId,
        senderId,
        type: 'new_response',
        message: '',
      };

      await expect(createNotification(notificationData)).rejects.toThrow();
    });
  });

  describe('getNotificationById', () => {
    it('should return notification if found', async () => {
      const created = await createNotification({
        recipientId,
        questionId,
        senderId,
        type: 'new_response',
        message: 'Test notification',
      });

      const notification = await getNotificationById(created._id.toString());

      expect(notification).not.toBeNull();
      expect(notification.message).toBe('Test notification');
    });

    it('should return null if notification not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const notification = await getNotificationById(fakeId);
      expect(notification).toBeNull();
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(getNotificationById('invalid-id')).rejects.toThrow(
        'Invalid notification ID'
      );
    });
  });

  describe('getNotificationsByStudentId', () => {
    beforeEach(async () => {
      const now = new Date();

      // Unread notifications
      await db.collection('notifications').insertOne({
        recipientId: new ObjectId(recipientId),
        questionId: new ObjectId(questionId),
        senderId: new ObjectId(senderId),
        type: 'new_response',
        message: 'Notification 1 - Unread',
        isRead: false,
        createdAt: new Date(now.getTime()),
      });

      await db.collection('notifications').insertOne({
        recipientId: new ObjectId(recipientId),
        questionId: new ObjectId(questionId),
        senderId: new ObjectId(senderId),
        type: 'new_response',
        message: 'Notification 2 - Unread',
        isRead: false,
        createdAt: new Date(now.getTime() - 2000),
      });

      // Read notification
      await db.collection('notifications').insertOne({
        recipientId: new ObjectId(recipientId),
        questionId: new ObjectId(questionId),
        senderId: new ObjectId(senderId),
        type: 'new_response',
        message: 'Notification 3 - Read',
        isRead: true,
        createdAt: new Date(now.getTime() - 4000),
      });
    });

    it('should return only unread notifications by default', async () => {
      const notifications = await getNotificationsByStudentId(recipientId);

      expect(notifications).toHaveLength(2);
      expect(notifications.every((n) => !n.isRead)).toBe(true);
    });

    it('should return all notifications when unreadOnly is false', async () => {
      const notifications = await getNotificationsByStudentId(
        recipientId,
        false
      );

      expect(notifications).toHaveLength(3);
    });

    it('should return notifications sorted by newest first', async () => {
      const notifications = await getNotificationsByStudentId(recipientId);

      expect(notifications[0].message).toBe('Notification 1 - Unread');
      expect(notifications[1].message).toBe('Notification 2 - Unread');
    });

    it('should return empty array if no notifications', async () => {
      const otherStudentId = '507f1f77bcf86cd799439099';
      const notifications = await getNotificationsByStudentId(otherStudentId);
      expect(notifications).toEqual([]);
    });

    it('should throw error for invalid student ID', async () => {
      await expect(getNotificationsByStudentId('invalid-id')).rejects.toThrow(
        'Invalid student ID'
      );
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      const created = await createNotification({
        recipientId,
        questionId,
        senderId,
        type: 'new_response',
        message: 'Test notification',
      });

      expect(created.isRead).toBe(false);

      const updated = await markNotificationAsRead(created._id.toString());

      expect(updated.isRead).toBe(true);
    });

    it('should throw error for invalid notification ID', async () => {
      await expect(markNotificationAsRead('invalid-id')).rejects.toThrow(
        'Invalid notification ID'
      );
    });

    it('should throw error if notification not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(markNotificationAsRead(fakeId)).rejects.toThrow(
        'Notification not found'
      );
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all student notifications as read', async () => {
      await createNotification({
        recipientId,
        questionId,
        senderId,
        type: 'new_response',
        message: 'Notification 1',
      });

      await createNotification({
        recipientId,
        questionId,
        senderId,
        type: 'new_response',
        message: 'Notification 2',
      });

      const result = await markAllNotificationsAsRead(recipientId);

      expect(result.success).toBe(true);
      expect(result.modifiedCount).toBe(2);

      const unreadCount = await getUnreadNotificationCount(recipientId);
      expect(unreadCount).toBe(0);
    });

    it('should return 0 modifiedCount if no unread notifications', async () => {
      const result = await markAllNotificationsAsRead(recipientId);

      expect(result.success).toBe(true);
      expect(result.modifiedCount).toBe(0);
    });

    it('should throw error for invalid student ID', async () => {
      await expect(markAllNotificationsAsRead('invalid-id')).rejects.toThrow(
        'Invalid student ID'
      );
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return correct count of unread notifications', async () => {
      await createNotification({
        recipientId,
        questionId,
        senderId,
        type: 'new_response',
        message: 'Notification 1',
      });

      await createNotification({
        recipientId,
        questionId,
        senderId,
        type: 'new_response',
        message: 'Notification 2',
      });

      const count = await getUnreadNotificationCount(recipientId);
      expect(count).toBe(2);
    });

    it('should return 0 if no unread notifications', async () => {
      const count = await getUnreadNotificationCount(recipientId);
      expect(count).toBe(0);
    });

    it('should throw error for invalid student ID', async () => {
      await expect(getUnreadNotificationCount('invalid-id')).rejects.toThrow(
        'Invalid student ID'
      );
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const created = await createNotification({
        recipientId,
        questionId,
        senderId,
        type: 'new_response',
        message: 'Test notification',
      });

      const result = await deleteNotification(created._id.toString());

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);

      const found = await getNotificationById(created._id.toString());
      expect(found).toBeNull();
    });

    it('should throw error for invalid notification ID', async () => {
      await expect(deleteNotification('invalid-id')).rejects.toThrow(
        'Invalid notification ID'
      );
    });

    it('should throw error if notification not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(deleteNotification(fakeId)).rejects.toThrow(
        'Notification not found'
      );
    });
  });
});
