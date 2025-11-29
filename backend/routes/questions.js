/**
 * Question Routes
 * CRUD operations for questions
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireAuth } from '../middlewares.js';
import { questionData, responseData, notificationData } from '../data/index.js';
import { isValidObjectId } from '../validation.js';

const router = express.Router();

/**
 * GET /api/questions/detail/:questionId
 * Get a specific question with all details
 */
router.get(
  '/detail/:questionId',
  requireAuth,
  [
    param('questionId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid question ID');
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

      const { questionId } = req.params;

      const question = await questionData.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          error: 'Question not found',
        });
      }

      res.json({
        success: true,
        question,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/questions/:courseId
 * Get all questions for a specific course with optional sorting
 */
router.get(
  '/:courseId',
  requireAuth,
  [
    param('courseId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid course ID');
      }
      return true;
    }),
    query('sort')
      .optional()
      .isIn(['answered', 'unanswered', 'newest', 'oldest']),
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

      const { courseId } = req.params;
      const { sort = 'newest' } = req.query;

      const questions = await questionData.getQuestionsByCourseId(
        courseId,
        sort
      );

      res.json({
        success: true,
        questions,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/questions
 * Create a new question
 */
router.post(
  '/',
  requireAuth,
  [
    body('courseId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid course ID');
      }
      return true;
    }),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must not exceed 200 characters'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 2000 })
      .withMessage('Content must not exceed 2000 characters'),
    body('isAnonymous')
      .optional()
      .isBoolean()
      .withMessage('isAnonymous must be a boolean'),
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

      const { courseId, title, content, isAnonymous = false } = req.body;
      const posterId = req.session.student.id;

      // Build question payload for creation
      const newQuestionPayload = {
        courseId,
        posterId,
        title,
        content,
        isAnonymous,
      };

      const newQuestion = await questionData.createQuestion(newQuestionPayload);

      res.status(201).json({
        success: true,
        question: newQuestion,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/questions/:questionId
 * Update a question (only by poster)
 */
router.patch(
  '/:questionId',
  requireAuth,
  [
    param('questionId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid question ID');
      }
      return true;
    }),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be 1-200 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Content must be 1-2000 characters'),
    body('isResolved')
      .optional()
      .isBoolean()
      .withMessage('isResolved must be a boolean'),
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

      const { questionId } = req.params;
      const updates = req.body;
      const currentUserId = req.session.student.id;

      // Check if question exists and user is the poster
      const question = await questionData.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          error: 'Question not found',
        });
      }

      if (question.posterId.toString() !== currentUserId) {
        return res.status(403).json({
          success: false,
          error: 'You can only edit your own questions',
        });
      }

      const updatedQuestion = await questionData.updateQuestion(
        questionId,
        updates
      );

      res.json({
        success: true,
        question: updatedQuestion,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/questions/:questionId
 * Delete a question (only by poster)
 */
router.delete(
  '/:questionId',
  requireAuth,
  [
    param('questionId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid question ID');
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

      const { questionId } = req.params;
      const currentUserId = req.session.student.id;

      // Check if question exists and user is the poster
      const question = await questionData.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          error: 'Question not found',
        });
      }

      if (question.posterId.toString() !== currentUserId) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own questions',
        });
      }

      // Cascade delete: remove all responses and notifications for this question
      await responseData.deleteResponsesByQuestionId(questionId);
      await notificationData.deleteNotificationsByQuestionId(questionId);

      // Delete the question itself
      await questionData.deleteQuestion(questionId);

      res.json({
        success: true,
        message: 'Question deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
