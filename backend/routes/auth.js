/**
 * Authentication Routes
 * Handles login, logout, and session checking
 */

import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { getStudentByEmail } from '../data/students.js';
import { requireAuth } from '../middlewares.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticates a student and creates a session
 */
router.post(
  '/login',
  [
    body('universityEmail')
      .isEmail()
      .withMessage('Must be a valid email')
      .normalizeEmail()
      .custom((value) => {
        if (!value.endsWith('@stevens.edu')) {
          throw new Error('Must be a Stevens email address');
        }
        return true;
      }),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { universityEmail, password } = req.body;

      // Find student by email
      const student = await getStudentByEmail(universityEmail);
      if (!student) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        student.hashedPassword
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      // Create session
      req.session.student = {
        id: student._id.toString(),
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.universityEmail,
      };

      // Return success without sensitive data
      res.json({
        success: true,
        student: {
          id: student._id.toString(),
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.universityEmail,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/logout
 * Destroys the user session
 */
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to logout',
      });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
});

/**
 * GET /api/auth/check
 * Checks if user is currently authenticated
 */
router.get('/check', (req, res) => {
  if (req.session && req.session.student) {
    res.json({
      loggedIn: true,
      student: req.session.student,
    });
  } else {
    res.json({
      loggedIn: false,
    });
  }
});

export default router;
