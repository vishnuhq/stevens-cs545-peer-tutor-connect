/**
 * Questions List Component
 * Shows all questions for a specific course
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { questionsApi, coursesApi } from "../api/api";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquarePlus,
  CheckCircle,
  MessageCircle,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import Header from "./Header";
import Spinner from "./Spinner";

const QuestionsList = () => {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]); // Store all questions for search
  const [course, setCourse] = useState(null);
  const [sortOption, setSortOption] = useState("newest");
  const [filterOption, setFilterOption] = useState("all"); // all, answered, unanswered
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSorting, setIsSorting] = useState(false); // Track if we're just sorting (don't show spinner)
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
    fetchQuestions();
  }, [courseId, sortOption]);

  // Apply filter and search whenever they change
  useEffect(() => {
    applyFilterAndSearch();
  }, [filterOption, searchQuery, allQuestions]);

  const fetchCourse = async () => {
    try {
      const response = await coursesApi.getCourseById(courseId);
      setCourse(response.data.course);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      // Only show loading spinner on initial load, not during sort changes
      if (allQuestions.length === 0) {
        setLoading(true);
      } else {
        setIsSorting(true);
      }
      const response = await questionsApi.getQuestionsByCourse(
        courseId,
        sortOption
      );
      const fetchedQuestions = response.data.questions || [];
      setAllQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
      setIsSorting(false);
    }
  };

  const applyFilterAndSearch = () => {
    let filtered = [...allQuestions];

    // Apply filter
    if (filterOption === "answered") {
      filtered = filtered.filter((q) => q.isResolved);
    } else if (filterOption === "unanswered") {
      filtered = filtered.filter((q) => !q.isResolved);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.content.toLowerCase().includes(query)
      );
    }

    setQuestions(filtered);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filter) => {
    setFilterOption(filter);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />

      <main
        id="main-content"
        className="container-centered fade-in"
        style={{ paddingTop: "2rem", paddingBottom: "2rem", maxWidth: "64rem" }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "1.5rem" }}>
          <ol
            className="flex items-center"
            style={{ gap: "0.5rem", fontSize: "0.875rem" }}
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
              style={{ width: "1rem", height: "1rem" }}
            />
            <li className="text-gray-700 font-semibold">
              {course ? course.courseCode : "Loading..."}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          style={{ gap: "1rem", marginBottom: "2rem" }}
        >
          <div>
            <h1
              className="font-bold text-gray-900 text-2xl sm:text-4xl"
              style={{ lineHeight: "1.2" }}
            >
              {course
                ? `${course.courseCode} - ${course.courseName}`
                : "Loading..."}
            </h1>
            <p
              className="text-gray-600 text-base sm:text-lg"
              style={{ marginTop: "0.5rem" }}
            >
              {questions.length}{" "}
              {questions.length === 1 ? "question" : "questions"}
            </p>
          </div>

          <button
            onClick={() => navigate(`/courses/${courseId}/questions/new`)}
            className="inline-flex items-center flex-shrink-0 whitespace-nowrap bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            style={{
              gap: "0.5rem",
              padding: "1rem 1.5rem",
              borderRadius: "0.75rem",
              fontSize: "1rem",
            }}
            aria-label="Post a new question"
          >
            <MessageSquarePlus
              style={{ width: "1.25rem", height: "1.25rem" }}
            />
            Post Question
          </button>
        </div>

        {/* Compact Filter/Search/Sort Bar */}
        <div
          className="bg-white border border-gray-200 shadow-sm"
          style={{
            borderRadius: "0.75rem",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            className="flex items-center flex-wrap"
            style={{ gap: "0.75rem" }}
          >
            {/* Filter Tabs */}
            <div className="flex items-center" style={{ gap: "0.375rem" }}>
              <button
                onClick={() => handleFilterChange("all")}
                className={`font-semibold transition-all ${
                  filterOption === "all"
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.8125rem",
                  whiteSpace: "nowrap",
                }}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange("unanswered")}
                className={`font-semibold transition-all ${
                  filterOption === "unanswered"
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.8125rem",
                  whiteSpace: "nowrap",
                }}
              >
                Unanswered
              </button>
              <button
                onClick={() => handleFilterChange("answered")}
                className={`font-semibold transition-all ${
                  filterOption === "answered"
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.8125rem",
                  whiteSpace: "nowrap",
                }}
              >
                Answered
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative" style={{ flex: 1, minWidth: "200px" }}>
              <Search
                className="absolute text-gray-400"
                style={{
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "1.125rem",
                  height: "1.125rem",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                style={{
                  padding: "0.5rem 2.5rem 0.5rem 2.5rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute text-gray-400 hover:text-gray-600 transition-colors"
                  style={{
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  aria-label="Clear search"
                >
                  <X style={{ width: "1.125rem", height: "1.125rem" }} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center" style={{ gap: "0.5rem" }}>
              <label
                htmlFor="sort"
                className="text-gray-700 font-semibold"
                style={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}
              >
                Sort by:
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-teal-500 font-medium transition-colors"
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div
            className="flex justify-center"
            style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
          >
            <Spinner size="lg" text="Loading questions..." />
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <div
              className="bg-white shadow-lg mx-auto"
              style={{
                padding: "3rem",
                borderRadius: "1rem",
                maxWidth: "28rem",
              }}
            >
              <MessageCircle
                className="text-gray-400 mx-auto"
                style={{ width: "5rem", height: "5rem", marginBottom: "1rem" }}
              />
              <h3
                className="font-semibold text-gray-900"
                style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}
              >
                No questions yet
              </h3>
              <p className="text-gray-600" style={{ marginBottom: "1.5rem" }}>
                Be the first to ask a question in this course!
              </p>
              <button
                onClick={() => navigate(`/courses/${courseId}/questions/new`)}
                className="inline-flex items-center bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-lg transition-all"
                style={{
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.75rem",
                }}
              >
                <MessageSquarePlus
                  style={{ width: "1.25rem", height: "1.25rem" }}
                />
                Post Question
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {questions.map((question) => (
              <div
                key={question._id}
                onClick={() => navigate(`/questions/${question._id}`)}
                className="bg-white shadow-sm hover:shadow-md cursor-pointer group border-2 border-gray-200 hover:border-teal-400 transition-all"
                style={{ borderRadius: "0.5rem", padding: "1rem 1.25rem" }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/questions/${question._id}`);
                  }
                }}
                aria-label={`View question: ${question.title}`}
              >
                {/* Question Header */}
                <div
                  className="flex items-start"
                  style={{ gap: "0.75rem", marginBottom: "0.5rem" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="flex items-center"
                      style={{ gap: "0.5rem", marginBottom: "0.375rem" }}
                    >
                      <h3
                        className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1"
                        style={{ fontSize: "1rem" }}
                      >
                        {question.title}
                      </h3>
                      {/* Resolved Badge */}
                      {question.isResolved && (
                        <div className="flex-shrink-0">
                          <div
                            className="flex items-center bg-green-100 text-green-700 font-semibold"
                            style={{
                              gap: "0.25rem",
                              padding: "0.125rem 0.5rem",
                              borderRadius: "0.375rem",
                              fontSize: "0.75rem",
                            }}
                          >
                            <CheckCircle
                              style={{ width: "0.875rem", height: "0.875rem" }}
                            />
                            Answered
                          </div>
                        </div>
                      )}
                    </div>
                    <p
                      className="text-gray-600 line-clamp-1 leading-normal"
                      style={{ fontSize: "0.875rem" }}
                    >
                      {question.content}
                    </p>
                  </div>
                </div>

                {/* Question Meta */}
                <div
                  className="flex items-center text-gray-600"
                  style={{ gap: "0.75rem", fontSize: "0.8125rem" }}
                >
                  <div
                    className="flex items-center"
                    style={{ gap: "0.375rem" }}
                  >
                    <div
                      className="bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center"
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        borderRadius: "50%",
                      }}
                    >
                      <span
                        className="text-white font-bold"
                        style={{ fontSize: "0.625rem" }}
                      >
                        {question.isAnonymous
                          ? "A"
                          : (question.posterName || "U")
                              .charAt(0)
                              .toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-700">
                      {question.isAnonymous
                        ? "Anonymous"
                        : question.posterName || "Unknown"}
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span>
                    {formatDistanceToNow(new Date(question.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {question.responseCount > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span
                        className="flex items-center font-medium text-teal-600"
                        style={{ gap: "0.25rem" }}
                      >
                        <MessageCircle
                          style={{ width: "0.875rem", height: "0.875rem" }}
                        />
                        {question.responseCount}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionsList;
