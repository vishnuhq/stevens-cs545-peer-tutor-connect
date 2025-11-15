/**
 * Responses Routes
 * CRUD operations for responses
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireAuth } from '../middlewares.js';
import {
  createResponse,
  getResponseById,
  getResponsesByQuestionId,
  updateResponse,
  deleteResponse,
} from '../data/responses.js';
import { getQuestionById } from '../data/questions.js';
import { createNotification } from '../data/notifications.js';
import { isValidObjectId } from '../validation.js';

const router = express.Router();

/**
 * GET /api/responses/:questionId
 * Get all responses for a question
 */
router.get(
  '/:questionId',
  requireAuth,
  [
    param('questionId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid question ID');
      }
      return true;
    }),
    query('sort').optional().isIn(['newest', 'oldest']),
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
      const { sort = 'newest' } = req.query;

      const responses = await getResponsesByQuestionId(questionId, sort);

      res.json({
        success: true,
        responses,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/responses
 * Create a new response to a question
 */
router.post(
  '/',
  requireAuth,
  [
    body('questionId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid question ID');
      }
      return true;
    }),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 1500 })
      .withMessage('Content must not exceed 1500 characters'),
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

      const { questionId, content, isAnonymous = false } = req.body;
      const posterId = req.session.student.id;

      const responseData = {
        questionId,
        posterId,
        content,
        isAnonymous,
      };

      const newResponse = await createResponse(responseData);

      // Create notification for question poster (if not posting to own question)
      try {
        const question = await getQuestionById(questionId);
        if (question && question.posterId.toString() !== posterId) {
          const responderName = isAnonymous
            ? 'Someone'
            : req.session.student.firstName;
          await createNotification({
            recipientId: question.posterId.toString(),
            questionId: questionId,
            senderId: posterId,
            type: 'new_response',
            message: `${responderName} replied to your question: "${question.title}"`,
          });
        }
      } catch (notifError) {
        // Log error but don't fail the response creation
        console.error('Failed to create notification:', notifError);
      }

      res.status(201).json({
        success: true,
        response: newResponse,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/responses/:responseId
 * Update a response's content (only by poster)
 */
router.patch(
  '/:responseId',
  requireAuth,
  [
    param('responseId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid response ID');
      }
      return true;
    }),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 1, max: 1500 })
      .withMessage('Content must be 1-1500 characters'),
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

      const { responseId } = req.params;
      const updates = req.body;
      const currentUserId = req.session.student.id;

      // Check if response exists and user is the poster
      const response = await getResponseById(responseId);
      if (!response) {
        return res.status(404).json({
          success: false,
          error: 'Response not found',
        });
      }

      if (response.posterId.toString() !== currentUserId) {
        return res.status(403).json({
          success: false,
          error: 'You can only edit your own responses',
        });
      }

      const updatedResponse = await updateResponse(responseId, updates);

      res.json({
        success: true,
        response: updatedResponse,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/responses/:responseId
 * Delete a response (only by poster)
 */
router.delete(
  '/:responseId',
  requireAuth,
  [
    param('responseId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid response ID');
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

      const { responseId } = req.params;
      const currentUserId = req.session.student.id;

      // Check if response exists and user is the poster
      const response = await getResponseById(responseId);
      if (!response) {
        return res.status(404).json({
          success: false,
          error: 'Response not found',
        });
      }

      if (response.posterId.toString() !== currentUserId) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own responses',
        });
      }

      await deleteResponse(responseId);

      res.json({
        success: true,
        message: 'Response deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/responses/:responseId/helpful
 * Mark or unmark a response as helpful (only by question poster)
 */
router.patch(
  '/:responseId/helpful',
  requireAuth,
  [
    param('responseId').custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid response ID');
      }
      return true;
    }),
    body('isHelpful').isBoolean().withMessage('isHelpful must be a boolean'),
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

      const { responseId } = req.params;
      const { isHelpful } = req.body;
      const currentUserId = req.session.student.id;

      // Get the response to find the response poster
      const response = await getResponseById(responseId);
      if (!response) {
        return res.status(404).json({
          success: false,
          error: 'Response not found',
        });
      }

      const updatedResponse = await updateResponse(responseId, { isHelpful });

      // Create notification when response is marked as helpful (not unmarked)
      if (isHelpful && response.posterId.toString() !== currentUserId) {
        try {
          const question = await getQuestionById(
            response.questionId.toString()
          );
          if (question) {
            await createNotification({
              recipientId: response.posterId.toString(),
              questionId: response.questionId.toString(),
              senderId: currentUserId,
              type: 'helpful_mark',
              message: `Your response to "${question.title}" was marked as helpful!`,
            });
          }
        } catch (notifError) {
          // Log error but don't fail the update
          console.error('Failed to create notification:', notifError);
        }
      }

      res.json({
        success: true,
        response: updatedResponse,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
