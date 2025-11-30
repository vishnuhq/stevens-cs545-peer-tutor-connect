/**
 * Data Layer Index
 * Central export point for all data access functions.
 * All routes must import data functions through this file only.
 *
 * @module data
 */

// Import all data functions as namespaces
import * as studentDataFunctions from './students.js';
import * as courseDataFunctions from './courses.js';
import * as questionDataFunctions from './questions.js';
import * as responseDataFunctions from './responses.js';
import * as notificationDataFunctions from './notifications.js';

/**
 * Student data access functions
 * Contains: createStudent, getStudentById, getStudentByEmail, getAllStudents, updateStudent, deleteStudent
 * @namespace studentData
 */
export const studentData = studentDataFunctions;

/**
 * Course data access functions
 * Contains: createCourse, getCourseById, getCourseByCode, getAllCourses, getCoursesByStudentId, updateCourse, deleteCourse
 * @namespace courseData
 */
export const courseData = courseDataFunctions;

/**
 * Question data access functions
 * Contains: createQuestion, getQuestionById, getQuestionsByCourseId,
 *           getNewQuestionCountsByCourseIds, updateQuestion, deleteQuestion
 * @namespace questionData
 */
export const questionData = questionDataFunctions;

/**
 * Response data access functions
 * Contains: createResponse, getResponseById, getResponsesByQuestionId, updateResponse, deleteResponse, deleteResponsesByQuestionId
 * @namespace responseData
 */
export const responseData = responseDataFunctions;

/**
 * Notification data access functions
 * Contains: createNotification, getNotificationById, getNotificationsByStudentId, markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount, deleteNotification, deleteNotificationsByQuestionId
 * @namespace notificationData
 */
export const notificationData = notificationDataFunctions;
