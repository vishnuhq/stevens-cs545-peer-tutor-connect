/**
 * Notifications Routes
 * Get and manage notifications
 */

import express from 'express';
import { param, query, validationResult } from 'express-validator';
import { requireAuth } from '../middlewares.js';
import {
  getNotificationsByStudentId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../data/notifications.js';
import { isValidObjectId } from '../validation.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications for the logged-in user
 */
router.get(
  '/',
  requireAuth,
  [
    query('unreadOnly')
      .optional()
      .isBoolean()
      .withMessage('unreadOnly must be a boolean'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const studentId = req.session.student.id;
      const unreadOnly = req.query.unreadOnly === 'false' ? false : true;

      const notifications = await getNotificationsByStudentId(
        studentId,
        unreadOnly
      );

      res.json({
        success: true,
        notifications,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/notifications/:notificationId/read
 * Mark a specific notification as read
 */
router.patch(
  '/:notificationId/read',
  requireAuth,
  [
    param('notificationId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid notification ID');
      }
      return true;
    }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { notificationId } = req.params;

      const updatedNotification = await markNotificationAsRead(notificationId);

      res.json({
        success: true,
        notification: updatedNotification,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the logged-in user
 */
router.patch('/read-all', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.session.student.id;

    const result = await markAllNotificationsAsRead(studentId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
