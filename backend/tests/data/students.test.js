/**
 * Tests for Student Data Functions
 * TDD approach: Tests written BEFORE implementation
 */

import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import {
  connectToDb,
  closeConnection,
  getDb,
} from '../../database_config/index.js';
import {
  createStudent,
  getStudentById,
  getStudentByEmail,
  getAllStudents,
  updateStudent,
  deleteStudent,
} from '../../data/students.js';

describe('Student Data Functions', () => {
  let db;
  let hashedPassword;

  beforeAll(async () => {
    // Connect to test database
    process.env.DB_NAME = 'peer-tutor-connect-test';
    db = await connectToDb();
    hashedPassword = await bcrypt.hash('password123', 10);
  });

  afterAll(async () => {
    // Clean up and close connection
    await db.collection('students').deleteMany({});
    await closeConnection();
  });

  beforeEach(async () => {
    // Clear students collection before each test
    await db.collection('students').deleteMany({});
  });

  describe('createStudent', () => {
    it('should create a new student with valid data', async () => {
      const studentData = {
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
        enrolledCourses: [],
      };

      const result = await createStudent(studentData);

      expect(result).toHaveProperty('_id');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.universityEmail).toBe('john.doe@stevens.edu');
      expect(result.major).toBe('Computer Science');
      expect(result.age).toBe(20);
      expect(result.enrolledCourses).toEqual([]);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should throw error if email is not @stevens.edu', async () => {
      const studentData = {
        firstName: 'Jane',
        lastName: 'Smith',
        universityEmail: 'jane@gmail.com',
        hashedPassword,
        major: 'Computer Science',
        age: 21,
      };

      await expect(createStudent(studentData)).rejects.toThrow(
        'University email must be a valid @stevens.edu address'
      );
    });

    it('should throw error if email already exists', async () => {
      const studentData = {
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      };

      await createStudent(studentData);

      await expect(createStudent(studentData)).rejects.toThrow(
        'A student with this email already exists'
      );
    });

    it('should throw error if age is out of range (too young)', async () => {
      const studentData = {
        firstName: 'Young',
        lastName: 'Student',
        universityEmail: 'young@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 16,
      };

      await expect(createStudent(studentData)).rejects.toThrow(
        'Age must be between 17 and 25'
      );
    });

    it('should throw error if age is out of range (too old)', async () => {
      const studentData = {
        firstName: 'Old',
        lastName: 'Student',
        universityEmail: 'old@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 26,
      };

      await expect(createStudent(studentData)).rejects.toThrow(
        'Age must be between 17 and 25'
      );
    });

    it('should throw error if required field is missing (firstName)', async () => {
      const studentData = {
        lastName: 'Doe',
        universityEmail: 'john@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      };

      await expect(createStudent(studentData)).rejects.toThrow(
        'First name is required'
      );
    });

    it('should throw error if required field is missing (lastName)', async () => {
      const studentData = {
        firstName: 'John',
        universityEmail: 'john@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      };

      await expect(createStudent(studentData)).rejects.toThrow(
        'Last name is required'
      );
    });

    it('should trim whitespace from string fields', async () => {
      const studentData = {
        firstName: '  John  ',
        lastName: '  Doe  ',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: '  Computer Science  ',
        age: 20,
      };

      const result = await createStudent(studentData);

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.major).toBe('Computer Science');
    });

    it('should convert email to lowercase', async () => {
      const studentData = {
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'JOHN.DOE@STEVENS.EDU',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      };

      const result = await createStudent(studentData);

      expect(result.universityEmail).toBe('john.doe@stevens.edu');
    });
  });

  describe('getStudentById', () => {
    it('should return student if found', async () => {
      const created = await createStudent({
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      });

      const student = await getStudentById(created._id.toString());

      expect(student).not.toBeNull();
      expect(student.firstName).toBe('John');
      expect(student.universityEmail).toBe('john.doe@stevens.edu');
    });

    it('should return null if student not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const student = await getStudentById(fakeId);
      expect(student).toBeNull();
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(getStudentById('invalid-id')).rejects.toThrow(
        'Invalid student ID'
      );
    });
  });

  describe('getStudentByEmail', () => {
    it('should return student if found', async () => {
      await createStudent({
        firstName: 'Jane',
        lastName: 'Smith',
        universityEmail: 'jane.smith@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 21,
      });

      const student = await getStudentByEmail('jane.smith@stevens.edu');

      expect(student).not.toBeNull();
      expect(student.firstName).toBe('Jane');
      expect(student.lastName).toBe('Smith');
    });

    it('should be case-insensitive', async () => {
      await createStudent({
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      });

      const student = await getStudentByEmail('JOHN.DOE@STEVENS.EDU');
      expect(student).not.toBeNull();
      expect(student.universityEmail).toBe('john.doe@stevens.edu');
    });

    it('should return null if not found', async () => {
      const student = await getStudentByEmail('nonexistent@stevens.edu');
      expect(student).toBeNull();
    });

    it('should throw error for invalid email format', async () => {
      await expect(getStudentByEmail('invalid-email')).rejects.toThrow();
    });

    it('should throw error for non-Stevens email', async () => {
      await expect(getStudentByEmail('test@gmail.com')).rejects.toThrow(
        'Email must be a valid @stevens.edu address'
      );
    });
  });

  describe('getAllStudents', () => {
    it('should return empty array when no students', async () => {
      const students = await getAllStudents();
      expect(students).toEqual([]);
    });

    it('should return all students', async () => {
      await createStudent({
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      });

      await createStudent({
        firstName: 'Jane',
        lastName: 'Smith',
        universityEmail: 'jane.smith@stevens.edu',
        hashedPassword,
        major: 'Software Engineering',
        age: 21,
      });

      const students = await getAllStudents();
      expect(students).toHaveLength(2);
    });
  });

  describe('updateStudent', () => {
    it('should update student fields', async () => {
      const created = await createStudent({
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      });

      const updates = {
        firstName: 'Jonathan',
        major: 'Software Engineering',
        age: 21,
      };

      const updated = await updateStudent(created._id.toString(), updates);

      expect(updated.firstName).toBe('Jonathan');
      expect(updated.major).toBe('Software Engineering');
      expect(updated.age).toBe(21);
      expect(updated.lastName).toBe('Doe'); // Unchanged
    });

    it('should throw error for invalid student ID', async () => {
      await expect(updateStudent('invalid-id', {})).rejects.toThrow(
        'Invalid student ID'
      );
    });

    it('should throw error if no updates provided', async () => {
      const created = await createStudent({
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      });

      await expect(updateStudent(created._id.toString(), {})).rejects.toThrow(
        'No updates provided'
      );
    });

    it('should throw error for disallowed field (email)', async () => {
      const created = await createStudent({
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      });

      await expect(
        updateStudent(created._id.toString(), {
          universityEmail: 'new@stevens.edu',
        })
      ).rejects.toThrow('Cannot update field: universityEmail');
    });

    it('should throw error if student not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(
        updateStudent(fakeId, { firstName: 'Test' })
      ).rejects.toThrow('Student not found');
    });

    it('should update updatedAt timestamp', async () => {
      const created = await createStudent({
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      });

      // Wait a moment to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await updateStudent(created._id.toString(), { age: 21 });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        created.updatedAt.getTime()
      );
    });
  });

  describe('deleteStudent', () => {
    it('should delete student successfully', async () => {
      const created = await createStudent({
        firstName: 'John',
        lastName: 'Doe',
        universityEmail: 'john.doe@stevens.edu',
        hashedPassword,
        major: 'Computer Science',
        age: 20,
      });

      const result = await deleteStudent(created._id.toString());

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);

      // Verify student is deleted
      const found = await getStudentById(created._id.toString());
      expect(found).toBeNull();
    });

    it('should throw error for invalid student ID', async () => {
      await expect(deleteStudent('invalid-id')).rejects.toThrow(
        'Invalid student ID'
      );
    });

    it('should throw error if student not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(deleteStudent(fakeId)).rejects.toThrow('Student not found');
    });
  });
});
