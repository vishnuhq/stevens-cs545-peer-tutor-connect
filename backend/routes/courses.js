/**
 * Courses Routes
 * Handles course-related endpoints
 */

import express from 'express';
import { param, validationResult } from 'express-validator';
import { requireAuth } from '../middlewares.js';
import { courseData, questionData } from '../data/index.js';
import { isValidObjectId } from '../validation.js';

const router = express.Router();

/**
 * GET /api/courses
 * Get all courses the logged-in student is enrolled in
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.session.student.id;
    const courses = await courseData.getCoursesByStudentId(studentId);

    // Get new question counts for all courses in a single query
    let newQuestionCounts = {};
    if (courses.length > 0) {
      const courseIds = courses.map((c) => c._id.toString());
      newQuestionCounts = await questionData.getNewQuestionCountsByCourseIds(
        courseIds
      );
    }

    // Merge counts into course objects
    const coursesWithCounts = courses.map((course) => ({
      ...course,
      newQuestionCount: newQuestionCounts[course._id.toString()] || 0,
    }));

    res.json({
      success: true,
      courses: coursesWithCounts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/:courseId
 * Get a specific course by ID
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
      const course = await courseData.getCourseById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found',
        });
      }

      res.json({
        success: true,
        course,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
