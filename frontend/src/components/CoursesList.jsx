/**
 * Courses List Component
 * Dashboard showing all enrolled courses
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '../api/api';
import { ChevronRight } from 'lucide-react';
import Header from './Header';
import Spinner from './Spinner';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getCourses();
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}/questions`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />

      <main
        id="main-content"
        className="container-centered fade-in"
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1
            className="font-bold text-gray-900 text-3xl sm:text-4xl"
            style={{ marginBottom: '0.5rem' }}
          >
            My Courses
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Select a course to view and post questions
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div
            className="flex justify-center"
            style={{ paddingTop: '4rem', paddingBottom: '4rem' }}
          >
            <Spinner size="lg" text="Loading courses..." />
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div
              className="bg-white shadow-lg"
              style={{
                padding: '3rem',
                borderRadius: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <BookOpen
                className="text-gray-400"
                style={{ width: '5rem', height: '5rem', marginBottom: '1rem' }}
              />
              <h3
                className="font-semibold text-gray-900"
                style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}
              >
                No courses found
              </h3>
              <p className="text-gray-600">
                You are not enrolled in any courses yet.
              </p>
            </div>
          </div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))',
              gap: '2rem',
            }}
          >
            {courses.map((course) => (
              <div
                key={course._id}
                onClick={() => handleCourseClick(course._id)}
                className="bg-white shadow-md card-hover cursor-pointer overflow-hidden group border-2 border-gray-200 hover:border-teal-400 hover:shadow-lg"
                style={{
                  borderRadius: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCourseClick(course._id);
                  }
                }}
                aria-label={`View discussion board for ${course.courseCode} - ${course.courseName}`}
              >
                {/* Course Header */}
                <div
                  className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700"
                  style={{
                    padding: '1.25rem',
                    height: '8.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <h3
                    className="font-bold text-white tracking-tight line-clamp-2 leading-tight"
                    style={{ fontSize: '1.5rem', lineHeight: '1.3' }}
                  >
                    {course.courseCode} {course.courseName}
                  </h3>
                  <div
                    className="flex items-center flex-wrap text-white/90 font-medium"
                    style={{
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      marginTop: 'auto',
                    }}
                  >
                    <span>Section {course.section}</span>
                    <span>•</span>
                    <span>{course.term}</span>
                    {/* New Questions Badge */}
                    {course.newQuestionCount > 0 && (
                      <>
                        <span>•</span>
                        <span
                          className="flex items-center bg-white/90 text-teal-700 font-semibold"
                          style={{
                            gap: '0.25rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                          }}
                        >
                          {course.newQuestionCount} new{' '}
                          {course.newQuestionCount === 1
                            ? 'question'
                            : 'questions'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Course Details */}
                <div
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <p
                        className="text-gray-500 uppercase tracking-wide font-semibold"
                        style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}
                      >
                        Instructor
                      </p>
                      <p
                        className="text-gray-900 font-medium"
                        style={{ fontSize: '0.9375rem' }}
                      >
                        {course.instructorName}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-gray-500 uppercase tracking-wide font-semibold"
                        style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}
                      >
                        Department
                      </p>
                      <p
                        className="text-gray-900 font-medium"
                        style={{ fontSize: '0.9375rem' }}
                      >
                        {course.department}
                      </p>
                    </div>
                  </div>

                  {/* View Questions Button */}
                  <div
                    className="flex items-center justify-between border-t border-gray-200"
                    style={{ paddingTop: '1rem', marginTop: 'auto' }}
                  >
                    <span
                      className="text-teal-600 font-semibold group-hover:text-teal-700"
                      style={{ fontSize: '0.875rem' }}
                    >
                      View Discussion Board
                    </span>
                    <ChevronRight
                      className="text-teal-600 group-hover:translate-x-2 transition-transform"
                      style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CoursesList;
