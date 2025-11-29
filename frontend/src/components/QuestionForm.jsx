/**
 * Question Form Component
 * Form for creating or editing a question
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { questionsApi, coursesApi } from '../api/api';
import { Save, X, ChevronRight, AlertCircle } from 'lucide-react';
import Header from './Header';
import Spinner from './Spinner';

const QuestionForm = ({ isEdit = false }) => {
  const { courseId, questionId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
    if (isEdit && questionId) {
      fetchQuestion();
    }
  }, [isEdit, questionId, courseId]);

  const fetchCourse = async () => {
    try {
      const response = await coursesApi.getCourseById(courseId);
      setCourse(response.data.course);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchQuestion = async () => {
    try {
      const response = await questionsApi.getQuestionById(questionId);
      const question = response.data.question;
      setTitle(question.title);
      setContent(question.content);
      setIsAnonymous(question.isAnonymous);
    } catch (error) {
      console.error('Failed to load question:', error);
      setErrorMessage('Failed to load question');
      setTimeout(() => navigate(-1), 2000);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length > 2000) {
      newErrors.content = 'Content must not exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (isEdit) {
        await questionsApi.updateQuestion(questionId, {
          title: title.trim(),
          content: content.trim(),
        });
        toast.success('Question updated successfully', {
          autoClose: 3000,
          onClick: () => navigate(`/questions/${questionId}`),
        });
        setTimeout(() => navigate(`/questions/${questionId}`), 500);
      } else {
        const response = await questionsApi.createQuestion({
          courseId,
          title: title.trim(),
          content: content.trim(),
          isAnonymous,
        });
        const newQuestionId = response.data.question._id;
        toast.success('Question posted successfully', {
          autoClose: 3000,
          onClick: () => navigate(`/questions/${newQuestionId}`),
        });
        setTimeout(() => navigate(`/questions/${newQuestionId}`), 500);
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save question';
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <Header />
        <div
          className="flex justify-center items-center"
          style={{ paddingTop: '4rem', paddingBottom: '4rem' }}
        >
          <Spinner size="lg" text="Loading question..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />

      <main
        id="main-content"
        className="container-centered fade-in"
        style={{ paddingTop: '2rem', paddingBottom: '2rem', maxWidth: '64rem' }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem' }}>
          <ol
            className="flex items-center"
            style={{ gap: '0.5rem', fontSize: '0.875rem' }}
          >
            <li>
              <Link
                to="/courses"
                className="text-teal-600 hover:text-teal-700 hover:underline font-medium"
              >
                My Courses
              </Link>
            </li>
            <ChevronRight
              className="text-gray-400"
              style={{ width: '1rem', height: '1rem' }}
            />
            <li>
              <Link
                to={`/courses/${courseId}/questions`}
                className="text-teal-600 hover:text-teal-700 hover:underline font-medium"
              >
                {course ? course.courseCode : 'Course'}
              </Link>
            </li>
            <ChevronRight
              className="text-gray-400"
              style={{ width: '1rem', height: '1rem' }}
            />
            <li className="text-gray-700 font-semibold">
              {isEdit ? 'Edit Question' : 'New Question'}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            className="font-bold text-gray-900 text-2xl sm:text-4xl"
            style={{ lineHeight: '1.2' }}
          >
            {isEdit ? 'Edit Question' : 'Post New Question'}
          </h1>
          <p
            className="text-gray-600 text-base sm:text-lg"
            style={{ marginTop: '0.75rem' }}
          >
            {isEdit
              ? 'Update your question details'
              : 'Ask your peers for help on course topics'}
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            className="bg-red-50 border border-red-200 text-red-800 flex items-start fade-in"
            style={{
              gap: '0.75rem',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle
              style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }}
            />
            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md border border-gray-100"
          style={{ borderRadius: '1rem', padding: '2.5rem' }}
        >
          {/* Title Field */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: '0.75rem' }}
            >
              <label
                htmlFor="title"
                className="block font-semibold text-gray-900"
                style={{ fontSize: '1rem' }}
              >
                Title *
              </label>
              <span
                className={`font-medium ${
                  title.length > 200 ? 'text-red-600' : 'text-gray-500'
                }`}
                style={{ fontSize: '0.875rem' }}
              >
                {title.length}/200
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How do I implement binary search recursively?"
              className={`w-full border focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                errors.title
                  ? 'border-red-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                padding: '0.875rem 1.25rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
              }}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p
                className="text-red-600 font-medium"
                style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}
                role="alert"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Content Field */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: '0.75rem' }}
            >
              <label
                htmlFor="content"
                className="block font-semibold text-gray-900"
                style={{ fontSize: '1rem' }}
              >
                Content *
              </label>
              <span
                className={`font-medium ${
                  content.length > 2000 ? 'text-red-600' : 'text-gray-500'
                }`}
                style={{ fontSize: '0.875rem' }}
              >
                {content.length}/2000
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide detailed information about your question. Include any code snippets, error messages, or specific areas where you're stuck..."
              rows={6}
              className={`w-full border focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-y ${
                errors.content
                  ? 'border-red-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                padding: '0.875rem 1.25rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                lineHeight: '1.6',
              }}
              disabled={isSubmitting}
            />
            {errors.content && (
              <p
                className="text-red-600 font-medium"
                style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}
                role="alert"
              >
                {errors.content}
              </p>
            )}
          </div>

          {/* Anonymous Toggle (only for new questions) */}
          {!isEdit && (
            <div
              className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100"
              style={{
                marginBottom: '2rem',
                padding: '1.25rem',
                borderRadius: '0.75rem',
              }}
            >
              <label
                className="flex items-start cursor-pointer"
                style={{ gap: '1rem' }}
              >
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="text-teal-600 border-gray-300 focus:ring-2 focus:ring-teal-500 flex-shrink-0"
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '0.25rem',
                    marginTop: '0.125rem',
                  }}
                  disabled={isSubmitting}
                />
                <div>
                  <span
                    className="font-semibold text-gray-900 block"
                    style={{ fontSize: '1rem', marginBottom: '0.25rem' }}
                  >
                    Post anonymously
                  </span>
                  <p className="text-gray-600" style={{ fontSize: '0.875rem' }}>
                    Your identity will be hidden from others. Only you will know
                    who posted this question.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div
            className="flex flex-wrap items-center border-t border-gray-100"
            style={{ gap: '0.75rem', paddingTop: '2rem' }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                gap: '0.5rem',
                padding: '0.875rem 2rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    className="border-2 border-white border-t-transparent animate-spin"
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      borderRadius: '50%',
                    }}
                  ></div>
                  {isEdit ? 'Updating...' : 'Posting...'}
                </>
              ) : (
                <>
                  <Save style={{ width: '1.25rem', height: '1.25rem' }} />
                  {isEdit ? 'Update Question' : 'Post Question'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border border-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                gap: '0.5rem',
                padding: '0.875rem 2rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
              }}
            >
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default QuestionForm;
