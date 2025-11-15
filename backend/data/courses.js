/**
 * Course Data Functions
 * CRUD operations for courses collection
 */

import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '../database_config/index.js';
import {
  validateString,
  isValidObjectId,
  validateArray,
} from '../validation.js';

/**
 * Creates a new course in the database
 * @param {Object} courseData - Course information
 * @returns {Promise<Object>} Created course document
 * @throws {Error} If validation fails or courseCode already exists
 */
export const createCourse = async (courseData) => {
  // Validate required fields
  const courseCode = validateString(
    courseData.courseCode,
    'Course code',
    1,
    20
  );
  const courseName = validateString(
    courseData.courseName,
    'Course name',
    1,
    200
  );
  const section = validateString(courseData.section, 'Section', 1, 10);
  const department = validateString(
    courseData.department,
    'Department',
    1,
    100
  );
  const instructorName = validateString(
    courseData.instructorName,
    'Instructor name',
    1,
    100
  );
  const instructorEmail = validateString(
    courseData.instructorEmail,
    'Instructor email'
  );
  const term = validateString(courseData.term, 'Term', 1, 50);

  // Validate enrolled students (optional)
  let enrolledStudents = [];
  if (courseData.enrolledStudents) {
    enrolledStudents = validateArray(
      courseData.enrolledStudents,
      'Enrolled students'
    );
    for (const studentId of enrolledStudents) {
      if (!isValidObjectId(studentId)) {
        throw new Error(`Invalid student ID: ${studentId}`);
      }
    }
  }

  // Check if courseCode already exists
  const coursesCollection = getCollection(COLLECTIONS.COURSES);
  const existingCourse = await coursesCollection.findOne({ courseCode });

  if (existingCourse) {
    throw new Error('A course with this code already exists');
  }

  // Create course document
  const newCourse = {
    courseCode,
    courseName,
    section,
    department,
    instructorName,
    instructorEmail,
    term,
    enrolledStudents: enrolledStudents.map((id) => new ObjectId(id)),
    createdAt: new Date(),
  };

  const result = await coursesCollection.insertOne(newCourse);

  if (!result.acknowledged) {
    throw new Error('Failed to create course');
  }

  return {
    _id: result.insertedId,
    ...newCourse,
  };
};

/**
 * Gets a course by ID
 * @param {string} courseId - Course ObjectId
 * @returns {Promise<Object|null>} Course document or null
 * @throws {Error} If ID is invalid
 */
export const getCourseById = async (courseId) => {
  if (!isValidObjectId(courseId)) {
    throw new Error('Invalid course ID');
  }

  const coursesCollection = getCollection(COLLECTIONS.COURSES);
  const course = await coursesCollection.findOne({
    _id: new ObjectId(courseId),
  });

  return course;
};

/**
 * Gets a course by course code
 * @param {string} courseCode - Course code (e.g., "CS545")
 * @returns {Promise<Object|null>} Course document or null
 * @throws {Error} If courseCode is invalid
 */
export const getCourseByCode = async (courseCode) => {
  const validCode = validateString(courseCode, 'Course code');

  const coursesCollection = getCollection(COLLECTIONS.COURSES);
  const course = await coursesCollection.findOne({ courseCode: validCode });

  return course;
};

/**
 * Gets all courses
 * @returns {Promise<Array>} Array of all course documents
 */
export const getAllCourses = async () => {
  const coursesCollection = getCollection(COLLECTIONS.COURSES);
  const courses = await coursesCollection.find({}).toArray();
  return courses;
};

/**
 * Gets all courses a student is enrolled in
 * @param {string} studentId - Student ObjectId
 * @returns {Promise<Array>} Array of course documents
 * @throws {Error} If studentId is invalid
 */
export const getCoursesByStudentId = async (studentId) => {
  if (!isValidObjectId(studentId)) {
    throw new Error('Invalid student ID');
  }

  const coursesCollection = getCollection(COLLECTIONS.COURSES);
  const courses = await coursesCollection
    .find({ enrolledStudents: new ObjectId(studentId) })
    .toArray();

  return courses;
};

/**
 * Updates a course
 * @param {string} courseId - Course ObjectId
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated course document
 * @throws {Error} If ID is invalid or update fails
 */
export const updateCourse = async (courseId, updates) => {
  if (!isValidObjectId(courseId)) {
    throw new Error('Invalid course ID');
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('No updates provided');
  }

  const allowedUpdates = [
    'courseName',
    'section',
    'department',
    'instructorName',
    'instructorEmail',
    'term',
    'enrolledStudents',
  ];
  const updateFields = {};

  // Validate and process each update field
  for (const [key, value] of Object.entries(updates)) {
    if (!allowedUpdates.includes(key)) {
      throw new Error(`Cannot update field: ${key}`);
    }

    if (key === 'enrolledStudents') {
      const students = validateArray(value, key);
      for (const studentId of students) {
        if (!isValidObjectId(studentId)) {
          throw new Error(`Invalid student ID: ${studentId}`);
        }
      }
      updateFields[key] = students.map((id) => new ObjectId(id));
    } else {
      // All other fields are strings
      updateFields[key] = validateString(value, key);
    }
  }

  const coursesCollection = getCollection(COLLECTIONS.COURSES);
  const result = await coursesCollection.findOneAndUpdate(
    { _id: new ObjectId(courseId) },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error('Course not found');
  }

  return result;
};

/**
 * Deletes a course
 * @param {string} courseId - Course ObjectId
 * @returns {Promise<Object>} Deletion result
 * @throws {Error} If ID is invalid or deletion fails
 */
export const deleteCourse = async (courseId) => {
  if (!isValidObjectId(courseId)) {
    throw new Error('Invalid course ID');
  }

  const coursesCollection = getCollection(COLLECTIONS.COURSES);
  const result = await coursesCollection.deleteOne({
    _id: new ObjectId(courseId),
  });

  if (result.deletedCount === 0) {
    throw new Error('Course not found');
  }

  return { success: true, deletedCount: result.deletedCount };
};
