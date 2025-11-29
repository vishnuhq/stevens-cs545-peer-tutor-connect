/**
 * Notification Data Functions
 * CRUD operations for notifications collection
 */

import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '../database_config/index.js';
import { validateString, isValidObjectId } from '../validation.js';

/**
 * Creates a new notification in the database
 * @param {Object} notificationData - Notification information
 * @returns {Promise<Object>} Created notification document
 * @throws {Error} If validation fails
 */
export const createNotification = async (notificationData) => {
  // Validate required fields
  const recipientId = notificationData.recipientId;
  if (!isValidObjectId(recipientId)) {
    throw new Error('Invalid recipient ID');
  }

  const questionId = notificationData.questionId;
  if (!isValidObjectId(questionId)) {
    throw new Error('Invalid question ID');
  }

  const senderId = notificationData.senderId;
  if (!isValidObjectId(senderId)) {
    throw new Error('Invalid sender ID');
  }

  const type = validateString(notificationData.type, 'Type');
  const message = validateString(notificationData.message, 'Message');

  // Create notification document
  const newNotification = {
    recipientId: new ObjectId(recipientId),
    questionId: new ObjectId(questionId),
    senderId: new ObjectId(senderId),
    type,
    message,
    isRead: false,
    createdAt: new Date(),
  };

  const notificationsCollection = getCollection(COLLECTIONS.NOTIFICATIONS);
  const result = await notificationsCollection.insertOne(newNotification);

  if (!result.acknowledged) {
    throw new Error('Failed to create notification');
  }

  return {
    _id: result.insertedId,
    ...newNotification,
  };
};

/**
 * Gets a notification by ID
 * @param {string} notificationId - Notification ObjectId
 * @returns {Promise<Object|null>} Notification document or null
 * @throws {Error} If ID is invalid
 */
export const getNotificationById = async (notificationId) => {
  if (!isValidObjectId(notificationId)) {
    throw new Error('Invalid notification ID');
  }

  const notificationsCollection = getCollection(COLLECTIONS.NOTIFICATIONS);
  const notification = await notificationsCollection.findOne({
    _id: new ObjectId(notificationId),
  });

  return notification;
};

/**
 * Gets notifications for a student
 * @param {string} studentId - Student ObjectId
 * @param {boolean} unreadOnly - Return only unread notifications (default: true)
 * @returns {Promise<Array>} Array of notification documents
 * @throws {Error} If studentId is invalid
 */
export const getNotificationsByStudentId = async (
  studentId,
  unreadOnly = true
) => {
  if (!isValidObjectId(studentId)) {
    throw new Error('Invalid student ID');
  }

  const notificationsCollection = getCollection(COLLECTIONS.NOTIFICATIONS);

  const query = { recipientId: new ObjectId(studentId) };
  if (unreadOnly) {
    query.isRead = false;
  }

  const notifications = await notificationsCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return notifications;
};

/**
 * Marks a notification as read
 * @param {string} notificationId - Notification ObjectId
 * @returns {Promise<Object>} Updated notification document
 * @throws {Error} If ID is invalid or notification not found
 */
export const markNotificationAsRead = async (notificationId) => {
  if (!isValidObjectId(notificationId)) {
    throw new Error('Invalid notification ID');
  }

  const notificationsCollection = getCollection(COLLECTIONS.NOTIFICATIONS);
  const result = await notificationsCollection.findOneAndUpdate(
    { _id: new ObjectId(notificationId) },
    { $set: { isRead: true } },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error('Notification not found');
  }

  return result;
};

/**
 * Marks all notifications as read for a student
 * @param {string} studentId - Student ObjectId
 * @returns {Promise<Object>} Update result
 * @throws {Error} If studentId is invalid
 */
export const markAllNotificationsAsRead = async (studentId) => {
  if (!isValidObjectId(studentId)) {
    throw new Error('Invalid student ID');
  }

  const notificationsCollection = getCollection(COLLECTIONS.NOTIFICATIONS);
  const result = await notificationsCollection.updateMany(
    { recipientId: new ObjectId(studentId), isRead: false },
    { $set: { isRead: true } }
  );

  return {
    success: true,
    modifiedCount: result.modifiedCount,
  };
};

/**
 * Gets count of unread notifications for a student
 * @param {string} studentId - Student ObjectId
 * @returns {Promise<number>} Count of unread notifications
 * @throws {Error} If studentId is invalid
 */
export const getUnreadNotificationCount = async (studentId) => {
  if (!isValidObjectId(studentId)) {
    throw new Error('Invalid student ID');
  }

  const notificationsCollection = getCollection(COLLECTIONS.NOTIFICATIONS);
  const count = await notificationsCollection.countDocuments({
    recipientId: new ObjectId(studentId),
    isRead: false,
  });

  return count;
};

/**
 * Deletes a notification
 * @param {string} notificationId - Notification ObjectId
 * @returns {Promise<Object>} Deletion result
 * @throws {Error} If ID is invalid or deletion fails
 */
export const deleteNotification = async (notificationId) => {
  if (!isValidObjectId(notificationId)) {
    throw new Error('Invalid notification ID');
  }

  const notificationsCollection = getCollection(COLLECTIONS.NOTIFICATIONS);
  const result = await notificationsCollection.deleteOne({
    _id: new ObjectId(notificationId),
  });

  if (result.deletedCount === 0) {
    throw new Error('Notification not found');
  }

  return { success: true, deletedCount: result.deletedCount };
};

/**
 * Deletes all notifications for a question (cascade delete)
 * @param {string} questionId - Question ObjectId
 * @returns {Promise<Object>} Deletion result with count
 * @throws {Error} If questionId is invalid
 */
export const deleteNotificationsByQuestionId = async (questionId) => {
  if (!isValidObjectId(questionId)) {
    throw new Error('Invalid question ID');
  }

  const notificationsCollection = getCollection(COLLECTIONS.NOTIFICATIONS);
  const result = await notificationsCollection.deleteMany({
    questionId: new ObjectId(questionId),
  });

  return { success: true, deletedCount: result.deletedCount };
};
