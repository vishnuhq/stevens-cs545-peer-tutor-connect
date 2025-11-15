/**
 * Tests for Course Data Functions
 * TDD approach: Tests written BEFORE implementation
 */

import { jest } from '@jest/globals';
import {
  connectToDb,
  closeConnection,
  getDb,
} from '../../database_config/index.js';
import {
  createCourse,
  getCourseById,
  getCourseByCode,
  getAllCourses,
  getCoursesByStudentId,
  updateCourse,
  deleteCourse,
} from '../../data/courses.js';

describe('Course Data Functions', () => {
  let db;

  beforeAll(async () => {
    process.env.DB_NAME = 'peer-tutor-connect-test';
    db = await connectToDb();
  });

  afterAll(async () => {
    await db.collection('courses').deleteMany({});
    await closeConnection();
  });

  beforeEach(async () => {
    await db.collection('courses').deleteMany({});
  });

  describe('createCourse', () => {
    it('should create a new course with valid data', async () => {
      const courseData = {
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
        enrolledStudents: [],
      };

      const result = await createCourse(courseData);

      expect(result).toHaveProperty('_id');
      expect(result.courseCode).toBe('CS545');
      expect(result.courseName).toBe('Human Computer Interaction');
      expect(result.section).toBe('WS');
      expect(result.department).toBe('Computer Science');
      expect(result.instructorName).toBe('Dr. Gregg Vesonder');
      expect(result.instructorEmail).toBe('gvesonde@stevens.edu');
      expect(result.term).toBe('Fall 2025');
      expect(result).toHaveProperty('createdAt');
    });

    it('should throw error if courseCode already exists', async () => {
      const courseData = {
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
      };

      await createCourse(courseData);

      await expect(createCourse(courseData)).rejects.toThrow(
        'A course with this code already exists'
      );
    });

    it('should throw error if required field is missing', async () => {
      const courseData = {
        courseCode: 'CS545',
        // courseName missing
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
      };

      await expect(createCourse(courseData)).rejects.toThrow();
    });

    it('should trim whitespace from string fields', async () => {
      const courseData = {
        courseCode: '  CS545  ',
        courseName: '  Human Computer Interaction  ',
        section: '  WS  ',
        department: '  Computer Science  ',
        instructorName: '  Dr. Gregg Vesonder  ',
        instructorEmail: 'gvesonde@stevens.edu',
        term: '  Fall 2025  ',
      };

      const result = await createCourse(courseData);

      expect(result.courseCode).toBe('CS545');
      expect(result.courseName).toBe('Human Computer Interaction');
      expect(result.section).toBe('WS');
    });
  });

  describe('getCourseById', () => {
    it('should return course if found', async () => {
      const created = await createCourse({
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
      });

      const course = await getCourseById(created._id.toString());

      expect(course).not.toBeNull();
      expect(course.courseCode).toBe('CS545');
    });

    it('should return null if course not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const course = await getCourseById(fakeId);
      expect(course).toBeNull();
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(getCourseById('invalid-id')).rejects.toThrow(
        'Invalid course ID'
      );
    });
  });

  describe('getCourseByCode', () => {
    it('should return course if found', async () => {
      await createCourse({
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
      });

      const course = await getCourseByCode('CS545');

      expect(course).not.toBeNull();
      expect(course.courseName).toBe('Human Computer Interaction');
    });

    it('should return null if not found', async () => {
      const course = await getCourseByCode('CS999');
      expect(course).toBeNull();
    });

    it('should throw error for invalid course code', async () => {
      await expect(getCourseByCode('')).rejects.toThrow();
    });
  });

  describe('getAllCourses', () => {
    it('should return empty array when no courses', async () => {
      const courses = await getAllCourses();
      expect(courses).toEqual([]);
    });

    it('should return all courses', async () => {
      await createCourse({
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
      });

      await createCourse({
        courseCode: 'CS590',
        courseName: 'Algorithms',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. William Hendrix',
        instructorEmail: 'whendrix@stevens.edu',
        term: 'Fall 2025',
      });

      const courses = await getAllCourses();
      expect(courses).toHaveLength(2);
    });
  });

  describe('getCoursesByStudentId', () => {
    it('should return courses student is enrolled in', async () => {
      const studentId = '507f1f77bcf86cd799439011';

      const course1 = await createCourse({
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
        enrolledStudents: [studentId],
      });

      const course2 = await createCourse({
        courseCode: 'CS590',
        courseName: 'Algorithms',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. William Hendrix',
        instructorEmail: 'whendrix@stevens.edu',
        term: 'Fall 2025',
        enrolledStudents: [studentId],
      });

      // Course student is NOT enrolled in
      await createCourse({
        courseCode: 'CS555',
        courseName: 'Agile Methods',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Michael Chen',
        instructorEmail: 'mchen@stevens.edu',
        term: 'Fall 2025',
        enrolledStudents: [],
      });

      const courses = await getCoursesByStudentId(studentId);

      expect(courses).toHaveLength(2);
      expect(courses.map((c) => c.courseCode)).toContain('CS545');
      expect(courses.map((c) => c.courseCode)).toContain('CS590');
      expect(courses.map((c) => c.courseCode)).not.toContain('CS555');
    });

    it('should return empty array if student not enrolled in any courses', async () => {
      const studentId = '507f1f77bcf86cd799439011';

      await createCourse({
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
        enrolledStudents: [],
      });

      const courses = await getCoursesByStudentId(studentId);
      expect(courses).toEqual([]);
    });

    it('should throw error for invalid student ID', async () => {
      await expect(getCoursesByStudentId('invalid-id')).rejects.toThrow(
        'Invalid student ID'
      );
    });
  });

  describe('updateCourse', () => {
    it('should update course fields', async () => {
      const created = await createCourse({
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
      });

      const updates = {
        instructorName: 'Dr. Jane Doe',
        section: 'A',
      };

      const updated = await updateCourse(created._id.toString(), updates);

      expect(updated.instructorName).toBe('Dr. Jane Doe');
      expect(updated.section).toBe('A');
      expect(updated.courseCode).toBe('CS545'); // Unchanged
    });

    it('should throw error for invalid course ID', async () => {
      await expect(updateCourse('invalid-id', {})).rejects.toThrow(
        'Invalid course ID'
      );
    });

    it('should throw error if no updates provided', async () => {
      const created = await createCourse({
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
      });

      await expect(updateCourse(created._id.toString(), {})).rejects.toThrow(
        'No updates provided'
      );
    });

    it('should throw error if course not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(updateCourse(fakeId, { section: 'A' })).rejects.toThrow(
        'Course not found'
      );
    });
  });

  describe('deleteCourse', () => {
    it('should delete course successfully', async () => {
      const created = await createCourse({
        courseCode: 'CS545',
        courseName: 'Human Computer Interaction',
        section: 'WS',
        department: 'Computer Science',
        instructorName: 'Dr. Gregg Vesonder',
        instructorEmail: 'gvesonde@stevens.edu',
        term: 'Fall 2025',
      });

      const result = await deleteCourse(created._id.toString());

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);

      const found = await getCourseById(created._id.toString());
      expect(found).toBeNull();
    });

    it('should throw error for invalid course ID', async () => {
      await expect(deleteCourse('invalid-id')).rejects.toThrow(
        'Invalid course ID'
      );
    });

    it('should throw error if course not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(deleteCourse(fakeId)).rejects.toThrow('Course not found');
    });
  });
});
