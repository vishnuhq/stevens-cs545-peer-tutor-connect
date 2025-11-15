/**
 * Student Data Functions
 * CRUD operations for students collection
 */

import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '../database_config/index.js';
import {
  validateString,
  validateNumber,
  isValidObjectId,
  isValidStevensEmail,
  validateArray,
} from '../validation.js';

/**
 * Creates a new student in the database
 * @param {Object} studentData - Student information
 * @param {string} studentData.firstName - First name
 * @param {string} studentData.lastName - Last name
 * @param {string} studentData.universityEmail - Stevens email
 * @param {string} studentData.hashedPassword - Bcrypt hashed password
 * @param {string} studentData.major - Major
 * @param {number} studentData.age - Age (17-25)
 * @param {Array<string>} [studentData.enrolledCourses=[]] - Course IDs
 * @returns {Promise<Object>} Created student document
 * @throws {Error} If validation fails or email already exists
 */
export const createStudent = async (studentData) => {
  // Validate required fields
  const firstName = validateString(studentData.firstName, 'First name', 1, 50);
  const lastName = validateString(studentData.lastName, 'Last name', 1, 50);
  const universityEmail = validateString(
    studentData.universityEmail,
    'University email'
  );
  const hashedPassword = validateString(studentData.hashedPassword, 'Password');
  const major = validateString(studentData.major, 'Major', 1, 100);
  const age = validateNumber(studentData.age, 'Age', 17, 25);

  // Validate email format
  if (!isValidStevensEmail(universityEmail)) {
    throw new Error('University email must be a valid @stevens.edu address');
  }

  // Validate enrolled courses (optional)
  let enrolledCourses = [];
  if (studentData.enrolledCourses) {
    enrolledCourses = validateArray(
      studentData.enrolledCourses,
      'Enrolled courses'
    );
    for (const courseId of enrolledCourses) {
      if (!isValidObjectId(courseId)) {
        throw new Error(`Invalid course ID: ${courseId}`);
      }
    }
  }

  // Check if email already exists
  const studentsCollection = getCollection(COLLECTIONS.STUDENTS);
  const existingStudent = await studentsCollection.findOne({
    universityEmail: universityEmail.toLowerCase(),
  });

  if (existingStudent) {
    throw new Error('A student with this email already exists');
  }

  // Create student document
  const newStudent = {
    firstName,
    lastName,
    universityEmail: universityEmail.toLowerCase(),
    hashedPassword,
    major,
    age,
    enrolledCourses: enrolledCourses.map((id) => new ObjectId(id)),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await studentsCollection.insertOne(newStudent);

  if (!result.acknowledged) {
    throw new Error('Failed to create student');
  }

  return {
    _id: result.insertedId,
    ...newStudent,
  };
};

/**
 * Gets a student by ID
 * @param {string} studentId - Student ObjectId
 * @returns {Promise<Object|null>} Student document or null
 * @throws {Error} If ID is invalid
 */
export const getStudentById = async (studentId) => {
  if (!isValidObjectId(studentId)) {
    throw new Error('Invalid student ID');
  }

  const studentsCollection = getCollection(COLLECTIONS.STUDENTS);
  const student = await studentsCollection.findOne({
    _id: new ObjectId(studentId),
  });

  return student;
};

/**
 * Gets a student by email
 * @param {string} email - University email
 * @returns {Promise<Object|null>} Student document or null
 * @throws {Error} If email is invalid
 */
export const getStudentByEmail = async (email) => {
  const validEmail = validateString(email, 'Email');

  if (!isValidStevensEmail(validEmail)) {
    throw new Error('Email must be a valid @stevens.edu address');
  }

  const studentsCollection = getCollection(COLLECTIONS.STUDENTS);
  const student = await studentsCollection.findOne({
    universityEmail: validEmail.toLowerCase(),
  });

  return student;
};

/**
 * Gets all students
 * @returns {Promise<Array>} Array of all student documents
 */
export const getAllStudents = async () => {
  const studentsCollection = getCollection(COLLECTIONS.STUDENTS);
  const students = await studentsCollection.find({}).toArray();
  return students;
};

/**
 * Updates a student
 * @param {string} studentId - Student ObjectId
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated student document
 * @throws {Error} If ID is invalid or update fails
 */
export const updateStudent = async (studentId, updates) => {
  if (!isValidObjectId(studentId)) {
    throw new Error('Invalid student ID');
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('No updates provided');
  }

  const allowedUpdates = [
    'firstName',
    'lastName',
    'major',
    'age',
    'enrolledCourses',
  ];
  const updateFields = {};

  // Validate and process each update field
  for (const [key, value] of Object.entries(updates)) {
    if (!allowedUpdates.includes(key)) {
      throw new Error(`Cannot update field: ${key}`);
    }

    if (key === 'firstName' || key === 'lastName') {
      updateFields[key] = validateString(value, key, 1, 50);
    } else if (key === 'major') {
      updateFields[key] = validateString(value, key, 1, 100);
    } else if (key === 'age') {
      updateFields[key] = validateNumber(value, key, 17, 25);
    } else if (key === 'enrolledCourses') {
      const courses = validateArray(value, key);
      for (const courseId of courses) {
        if (!isValidObjectId(courseId)) {
          throw new Error(`Invalid course ID: ${courseId}`);
        }
      }
      updateFields[key] = courses.map((id) => new ObjectId(id));
    }
  }

  updateFields.updatedAt = new Date();

  const studentsCollection = getCollection(COLLECTIONS.STUDENTS);
  const result = await studentsCollection.findOneAndUpdate(
    { _id: new ObjectId(studentId) },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error('Student not found');
  }

  return result;
};

/**
 * Deletes a student
 * @param {string} studentId - Student ObjectId
 * @returns {Promise<Object>} Deletion result
 * @throws {Error} If ID is invalid or deletion fails
 */
export const deleteStudent = async (studentId) => {
  if (!isValidObjectId(studentId)) {
    throw new Error('Invalid student ID');
  }

  const studentsCollection = getCollection(COLLECTIONS.STUDENTS);
  const result = await studentsCollection.deleteOne({
    _id: new ObjectId(studentId),
  });

  if (result.deletedCount === 0) {
    throw new Error('Student not found');
  }

  return { success: true, deletedCount: result.deletedCount };
};
