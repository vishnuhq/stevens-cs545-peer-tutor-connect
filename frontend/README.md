# Peer-Tutor Connect Frontend

The React-based single-page application (SPA) for Peer-Tutor Connect, providing an intuitive and responsive user interface for students to post questions, provide responses, and receive real-time notifications. Built with Vite and styled using Tailwind CSS v4.

## Overview

This frontend application handles all client-side interactions for the peer tutoring platform. It communicates with the Express backend via RESTful API calls, manages authentication state using React Context, and provides a seamless user experience across all device sizes (mobile, tablet, desktop).

**Key Responsibilities:**

- User authentication (login/logout) with session persistence
- Display enrolled courses and course-specific question forums
- Create, edit, and delete questions and responses
- Real-time notification system with unread count
- Anonymous posting functionality
- Responsive design supporting mobile-first approach
- Accessibility features following WCAG AA guidelines

## Tech Stack

### Core Framework

- **React** v19.0.0 - Component-based UI library
- **React DOM** v19.0.0 - React rendering for web
- **Vite** v6.0.0 - Fast build tool and development server

### Routing & State

- **React Router DOM** v6.28.0 - Client-side routing
- **React Context API** - Global authentication state management

### Styling

- **Tailwind CSS** v4.0.0 - Utility-first CSS framework
- **@tailwindcss/vite** v4.0.0 - Vite plugin for Tailwind v4

### HTTP & API

- **Axios** v1.7.0 - Promise-based HTTP client with interceptors

### UI Libraries

- **React Toastify** v11.0.0 - Toast notifications
- **Lucide React** v0.468.0 - Icon library
- **date-fns** v4.1.0 - Date formatting and manipulation

### Development Tools

- **ESLint** v9.17.0 - Code linting
- **eslint-plugin-react** v7.37.0 - React-specific linting rules
- **eslint-plugin-react-hooks** v5.0.0 - Hooks linting rules

### Requirements

- **Node.js**: v24.11.1 or higher

## Project Structure

```
frontend/
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite configuration with proxy
├── tailwind.config.js            # Tailwind CSS configuration
├── .eslintrc.js                  # ESLint configuration
├── src/
│   ├── main.jsx                  # React application entry point
│   ├── App.jsx                   # Main app component with routing
│   ├── index.css                 # Global styles + Tailwind directives
│   ├── components/               # React components (12 total)
│   │   ├── Login.jsx             # Landing page + login form
│   │   ├── Header.jsx            # Navigation bar with notifications
│   │   ├── CoursesList.jsx       # Student's enrolled courses
│   │   ├── QuestionsList.jsx     # Questions for a specific course
│   │   ├── QuestionDetail.jsx    # Full question with all responses
│   │   ├── QuestionForm.jsx      # Create/edit question form
│   │   ├── ResponseForm.jsx      # Create response form
│   │   ├── NotificationList.jsx  # Notification dropdown
│   │   ├── HelpWidget.jsx        # Floating help guide button
│   │   ├── ScrollToTopButton.jsx # Scroll to top button
│   │   ├── ProtectedRoute.jsx    # Route wrapper for authentication
│   │   └── Spinner.jsx           # Loading indicator component
│   ├── context/                  # React Context providers
│   │   └── AuthContext.jsx       # Global authentication state
│   └── api/                      # API integration layer
│       └── api.js                # Axios instance + all API calls
└── public/                       # Static assets (if any)
```

### Component Breakdown

**Public Components:**

- **Login.jsx** - Landing page with email/password form, displays project description

**Protected Components (require authentication):**

- **Header.jsx** - Top navigation with user info, logout, and notification bell icon
- **CoursesList.jsx** - Grid of enrolled courses with student count
- **QuestionsList.jsx** - List of questions for a course with sort/filter options
- **QuestionDetail.jsx** - Full question content with all responses, helpful marking, resolve functionality
- **QuestionForm.jsx** - Form to create or edit questions with anonymous option
- **ResponseForm.jsx** - Form to create responses with anonymous option
- **NotificationList.jsx** - Dropdown list of notifications with mark as read functionality

**Utility Components:**

- **HelpWidget.jsx** - Floating help guide button with user instructions, responsive mobile full-screen view
- **ScrollToTopButton.jsx** - Scroll to top button that appears after scrolling down 300px
- **ProtectedRoute.jsx** - HOC that checks authentication before rendering protected routes
- **Spinner.jsx** - Reusable loading spinner with customizable size and text

**Context Providers:**

- **AuthContext.jsx** - Provides global authentication state (user, login, logout, isAuthenticated)

**API Module:**

- **api.js** - Centralized API client with:
  - Axios instance configured with base URL and credentials
  - Response interceptor for 401 error handling
  - Organized API call functions by domain (auth, courses, questions, responses, notifications)

## Installation and Setup

### Prerequisites

Before starting, ensure you have the following installed:

- Node.js v24.11.1 or higher
- npm (comes with Node.js)
- Backend server running on port 3000

### Step 1: Install Dependencies

Navigate to the frontend directory and install all required packages:

```bash
cd frontend
npm install
```

This will install all dependencies listed in `package.json`, including React, Vite, Tailwind CSS, Axios, and other libraries.

### Step 2: Verify Backend Connection

Ensure the backend server is running on `http://localhost:3000` before starting the frontend. The frontend uses a Vite proxy to forward API requests to the backend.

**Check backend status:**

```bash
# In a separate terminal, navigate to backend directory
cd ../backend

# Verify backend is running
npm start
# Should see: "Server running on http://localhost:3000"
```

### Step 3: Start Development Server

Start the Vite development server with hot module replacement:

```bash
npm run dev
```

You should see output similar to:

```
VITE v6.0.0  ready in 350 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Step 4: Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

You will see the login page. Use any of the seeded student accounts to log in:

**Demo Account:**

- Email: `aditi.sharma@stevens.edu`
- Password: `password123`

All seeded accounts use the password: `password123`

### Step 5: Development Workflow

The development server supports hot module replacement (HMR), meaning changes to your code will be reflected immediately in the browser without a full page reload.

**Common Development Commands:**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint to check code quality
```

## Environment Variables

Unlike the backend, the frontend does not require a separate `.env` file for local development. Configuration is handled through Vite's `vite.config.js` file.

### Vite Configuration

The `vite.config.js` file contains critical settings for the development environment:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(), // React plugin for JSX transformation
    tailwindcss(), // Tailwind CSS v4 Vite plugin
  ],
  server: {
    port: 5173, // Frontend runs on port 5173
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Backend API URL
        changeOrigin: true, // Change origin to target URL
      },
    },
  },
});
```

### Proxy Configuration Explained

The proxy configuration forwards all requests starting with `/api` to the backend server:

- **Frontend URL**: `http://localhost:5173`
- **API Request**: `http://localhost:5173/api/auth/login`
- **Proxied To**: `http://localhost:3000/api/auth/login`

**Why use a proxy?**

- Avoids CORS issues during development
- Simplifies API calls (no need to specify full backend URL)
- Enables session cookies to work correctly across ports
- Mimics production setup where frontend and backend share the same domain

### Changing Backend URL

If your backend is running on a different port or host, update the proxy target in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',  // Change port if needed
    changeOrigin: true,
  },
}
```

### Production Configuration

For production, the frontend will be served as static files, and the backend URL should be configured differently:

1. Update the `baseURL` in `src/api/api.js` to use an environment variable
2. Use Vite's environment variable support: `import.meta.env.VITE_API_URL`
3. Set the production API URL in deployment configuration

## API Integration

The frontend communicates with the backend through a centralized API client built with Axios. All API calls are organized by domain in `src/api/api.js`.

### Axios Instance Configuration

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // All requests start with /api
  withCredentials: true, // Send cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Key Configuration:**

- **baseURL**: `/api` - Vite proxy forwards to backend
- **withCredentials**: `true` - Essential for session-based authentication (sends httpOnly cookies)
- **headers**: JSON content type for all requests

### Response Interceptor

The API client includes a response interceptor for global error handling:

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
```

**Behavior:**

- If any API call returns 401 (Unauthorized), the user is automatically redirected to the login page
- This handles session expiration and invalid authentication

### API Call Organization

All API calls are organized into domain-specific objects:

**1. Authentication API**

```javascript
export const authApi = {
  login: (email, password) =>
    api.post("/auth/login", { universityEmail: email, password }),
  logout: () => api.post("/auth/logout"),
  checkAuth: () => api.get("/auth/check"),
};
```

**2. Courses API**

```javascript
export const coursesApi = {
  getCourses: () => api.get("/courses"),
  getCourseById: (courseId) => api.get(`/courses/${courseId}`),
};
```

**3. Questions API**

```javascript
export const questionsApi = {
  getQuestionsByCourse: (courseId, sort = "newest") =>
    api.get(`/questions/${courseId}`, { params: { sort } }),
  getQuestionById: (questionId) => api.get(`/questions/detail/${questionId}`),
  createQuestion: (data) => api.post("/questions", data),
  updateQuestion: (questionId, data) =>
    api.patch(`/questions/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/questions/${questionId}`),
};
```

**4. Responses API**

```javascript
export const responsesApi = {
  getResponses: (questionId, sort = "newest") =>
    api.get(`/responses/${questionId}`, { params: { sort } }),
  createResponse: (data) => api.post("/responses", data),
  updateResponse: (responseId, data) =>
    api.patch(`/responses/${responseId}`, data),
  deleteResponse: (responseId) => api.delete(`/responses/${responseId}`),
  markAsHelpful: (responseId, isHelpful) =>
    api.patch(`/responses/${responseId}/helpful`, { isHelpful }),
};
```

**5. Notifications API**

```javascript
export const notificationsApi = {
  getNotifications: (unreadOnly = true) =>
    api.get("/notifications", { params: { unreadOnly } }),
  getNotificationCount: () => api.get("/notifications/count"),
  markAsRead: (notificationId) =>
    api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
};
```

### Using API Calls in Components

**Example: Login Component**

```javascript
import { authApi } from "../api/api";
import { useAuth } from "../context/AuthContext";

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await authApi.login(email, password);
    // Context handles state update
    toast.success("Login successful!");
    navigate("/courses");
  } catch (error) {
    toast.error(error.response?.data?.error || "Login failed");
  }
};
```

**Example: Fetching Courses**

```javascript
import { coursesApi } from "../api/api";

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getCourses();
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to load courses");
    }
  };
  fetchCourses();
}, []);
```

### Error Handling Best Practices

1. **Wrap API calls in try-catch blocks**
2. **Display user-friendly error messages** using React Toastify
3. **Handle loading states** with spinner components
4. **Check for specific error codes** to provide context-specific feedback
5. **Graceful degradation** - show empty states instead of broken UI

## Authentication Flow

The application uses session-based authentication with React Context for global state management.

### Authentication Architecture

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Browser   │ <───> │  AuthContext │ <───> │   Backend   │
│  (Cookies)  │       │   (State)    │       │  (Session)  │
└─────────────┘       └──────────────┘       └─────────────┘
```

**Flow Components:**

1. **Browser** - Stores httpOnly session cookie
2. **AuthContext** - Manages user state and authentication methods
3. **Backend** - Validates session and manages user data

### AuthContext Implementation

The `AuthContext.jsx` provides global authentication state to all components:

```javascript
import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authApi.checkAuth();
      if (response.data.loggedIn) {
        setUser(response.data.student);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    setUser(response.data.student);
    return response.data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

**State Properties:**

- `user` - Current authenticated user object (null if not logged in)
- `loading` - Boolean indicating initial authentication check
- `login(email, password)` - Function to log in
- `logout()` - Function to log out
- `isAuthenticated` - Computed boolean (true if user exists)

### Authentication Flow Steps

**1. Application Mount (Initial Load)**

```
User opens app
    ↓
App.jsx renders
    ↓
AuthProvider mounts
    ↓
useEffect calls checkAuthStatus()
    ↓
GET /api/auth/check (with session cookie)
    ↓
Backend validates session
    ↓
Returns { loggedIn: true/false, student: {...} }
    ↓
Update user state
    ↓
Set loading = false
    ↓
Routes render based on auth state
```

**2. Login Flow**

```
User submits login form (Login.jsx)
    ↓
handleLogin calls login(email, password)
    ↓
POST /api/auth/login with credentials
    ↓
Backend validates credentials
    ↓
Creates session, sets httpOnly cookie
    ↓
Returns { student: {...} }
    ↓
Context updates user state
    ↓
Navigate to /courses
```

**3. Protected Route Access**

```
User navigates to protected route
    ↓
ProtectedRoute.jsx checks isAuthenticated
    ↓
If true: render component
    ↓
If false: redirect to login (/)
```

**4. Logout Flow**

```
User clicks logout (Header.jsx)
    ↓
handleLogout calls logout()
    ↓
POST /api/auth/logout
    ↓
Backend destroys session
    ↓
Context sets user = null
    ↓
Navigate to login (/)
```

**5. Session Expiration**

```
User makes API request
    ↓
Backend session expired
    ↓
Returns 401 Unauthorized
    ↓
Axios interceptor catches 401
    ↓
Redirects to login (/)
```

### Protected Routes Implementation

The `ProtectedRoute.jsx` component wraps authenticated routes:

```javascript
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spinner size="lg" text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

**Usage in App.jsx:**

```javascript
<Route
  path="/courses"
  element={
    <ProtectedRoute>
      <CoursesList />
    </ProtectedRoute>
  }
/>
```

### Session Management

**Session Cookie Properties (set by backend):**

- **httpOnly**: true - Prevents JavaScript access (XSS protection)
- **sameSite**: 'lax' - CSRF protection
- **maxAge**: 48 hours - Session expiration time
- **secure**: true in production - HTTPS only

**Frontend Responsibilities:**

- Include `withCredentials: true` in all Axios requests
- Handle 401 errors by redirecting to login
- Check authentication on app mount
- Provide loading states during auth checks

## Styling

The frontend uses Tailwind CSS v4 with a utility-first approach, custom CSS variables, and responsive design principles.

### Tailwind CSS v4 Integration

Tailwind CSS v4 is integrated using the `@tailwindcss/vite` plugin, which provides a modern CSS-first configuration:

**vite.config.js:**

```javascript
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 Vite plugin
  ],
});
```

**tailwind.config.js:**

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
      },
    },
  },
  plugins: [],
};
```

### Custom CSS Variables

The `src/index.css` file defines custom CSS variables for consistent design tokens:

```css
@import "tailwindcss";

@theme {
  /* Custom color palette */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-light: #eff6ff;
  --color-primary-dark: #1e40af;
  --color-secondary: #6366f1;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;

  /* Spacing system */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

### Styling Approach

**1. Utility-First with Tailwind**

Most styling is done inline using Tailwind utility classes:

```jsx
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
  Submit Question
</button>
```

**2. Custom Utility Classes**

Reusable utility classes are defined in `index.css` for common patterns:

```css
/* Card hover effect */
.card-hover {
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* Button base styles */
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-base);
  cursor: pointer;
  border: none;
}
```

**3. Animation Classes**

Custom animations enhance user experience:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn var(--transition-slow) ease-in;
}

.slide-down {
  animation: slideDown var(--transition-slow) ease-out;
}
```

**4. Responsive Design**

Mobile-first responsive breakpoints:

```jsx
<div
  className="
  grid
  grid-cols-1          {/* Mobile: 1 column */}
  sm:grid-cols-2       {/* Tablet (640px+): 2 columns */}
  lg:grid-cols-3       {/* Desktop (1024px+): 3 columns */}
  gap-4
  p-4
"
>
  {/* Course cards */}
</div>
```

**Breakpoints:**

- **Default (0-639px)**: Mobile devices
- **sm (640px+)**: Small tablets
- **md (768px+)**: Tablets
- **lg (1024px+)**: Desktops
- **xl (1280px+)**: Large screens

**5. Accessibility Features**

Focus visible outlines for keyboard navigation:

```css
*:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Better focus rings for form elements */
input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

Skip to main content link:

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: white;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Component Styling Example

**CoursesList.jsx** - Demonstrates responsive grid with hover effects:

```jsx
<div className="min-h-screen bg-gray-50">
  <Header />
  <main className="container-centered py-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">My Courses</h1>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div
          key={course._id}
          className="bg-white rounded-lg shadow-md p-6 card-hover cursor-pointer"
          onClick={() => navigate(`/courses/${course._id}/questions`)}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {course.courseCode}
          </h2>
          <p className="text-gray-600 mb-4">{course.courseName}</p>
          <div className="flex items-center text-sm text-gray-500">
            <UsersIcon className="w-4 h-4 mr-2" />
            {course.enrolledStudents.length} students
          </div>
        </div>
      ))}
    </div>
  </main>
</div>
```

### Icons with Lucide React

The application uses Lucide React for consistent icon design:

```jsx
import { Bell, LogOut, Search, Send } from "lucide-react";

<button className="relative p-2 hover:bg-gray-100 rounded-full">
  <Bell className="w-6 h-6 text-gray-600" />
  {unreadCount > 0 && (
    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount}
    </span>
  )}
</button>;
```

## Troubleshooting

### Common Issues and Solutions

#### 1. API Proxy Not Working (CORS Errors)

**Symptoms:**

- Console shows CORS errors: `Access-Control-Allow-Origin`
- API requests fail with network errors
- Cannot log in or fetch data

**Solutions:**

a. Verify backend is running:

```bash
# Check if backend is listening on port 3000
curl http://localhost:3000/api/auth/check
# Should return JSON response
```

b. Check Vite proxy configuration in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',  // Ensure this matches backend port
      changeOrigin: true,
    },
  },
}
```

c. Restart both frontend and backend servers:

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

d. Verify backend CORS configuration allows `http://localhost:5173`:

```javascript
// backend/app.js
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

#### 2. Login Not Persisting / Session Issues

**Symptoms:**

- Successfully log in but immediately logged out
- Refresh page and lose authentication
- Session cookie not being sent

**Solutions:**

a. Ensure `withCredentials: true` in Axios instance:

```javascript
// src/api/api.js
const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Must be true
});
```

b. Check browser cookie settings:

- Open DevTools > Application > Cookies
- Look for `connect.sid` cookie from `localhost:5173`
- Ensure cookies are not blocked by browser settings

c. Clear browser cookies and cache:

```
Chrome: DevTools > Application > Clear storage > Clear site data
Firefox: DevTools > Storage > Clear All
Safari: Develop > Empty Caches
```

d. Verify backend session configuration:

```javascript
// backend/app.js
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 48,
    },
  })
);
```

#### 3. Styling Not Applying

**Symptoms:**

- Page looks unstyled or broken
- Tailwind classes not working
- Custom styles not visible

**Solutions:**

a. Verify Tailwind directives in `src/index.css`:

```css
@import "tailwindcss";
```

b. Check `tailwind.config.js` content paths:

```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",  // Must include all component files
],
```

c. Restart Vite development server:

```bash
# Stop the server (Ctrl+C)
# Clear Vite cache
rm -rf .vite

# Restart
npm run dev
```

d. Check for CSS import in `main.jsx`:

```javascript
import "./index.css"; // Must be imported
```

e. Clear browser cache and hard reload:

```
Chrome: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
```

#### 4. White Screen / Blank Page

**Symptoms:**

- Application shows blank white screen
- No errors in console
- React components not rendering

**Solutions:**

a. Check browser console for JavaScript errors:

```
Open DevTools > Console tab
Look for red error messages
```

b. Verify React Router setup in `App.jsx`:

```javascript
import { BrowserRouter } from "react-router-dom";

const App = () => (
  <BrowserRouter>
    {" "}
    {/* Must wrap entire app */}
    <AuthProvider>
      <Routes>{/* routes */}</Routes>
    </AuthProvider>
  </BrowserRouter>
);
```

c. Ensure `main.jsx` renders to correct element:

```javascript
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

d. Check `index.html` has root element:

```html
<div id="root"></div>
```

e. Reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 5. React Router Navigation Not Working

**Symptoms:**

- Clicking links doesn't navigate
- URL changes but page doesn't update
- Routes render wrong components

**Solutions:**

a. Use `useNavigate` hook instead of `<a>` tags:

```javascript
import { useNavigate } from "react-router-dom";

const MyComponent = () => {
  const navigate = useNavigate();

  return <button onClick={() => navigate("/courses")}>Go to Courses</button>;
};
```

b. Verify routes are defined in `App.jsx`:

```javascript
<Routes>
  <Route path="/" element={<Login />} />
  <Route
    path="/courses"
    element={
      <ProtectedRoute>
        <CoursesList />
      </ProtectedRoute>
    }
  />
  {/* ... more routes */}
</Routes>
```

c. Check for typos in route paths:

```javascript
// Make sure paths match exactly
navigate("/courses"); // Not '/course' or '/Courses'
```

#### 6. Build Errors

**Symptoms:**

- `npm run build` fails
- Production build doesn't work
- Module not found errors

**Solutions:**

a. Check Node.js version:

```bash
node --version
# Should be v24.11.1 or higher
```

b. Verify all imports are correct:

```javascript
// Use .jsx extension for JSX files
import Login from "./components/Login.jsx"; // Not just './components/Login'
```

c. Check for unused imports:

```bash
npm run lint
# Fix any ESLint errors
```

d. Clear Vite cache and rebuild:

```bash
rm -rf .vite dist
npm run build
```

#### 7. Notifications Not Updating

**Symptoms:**

- Notification count doesn't update
- New notifications don't appear
- Badge shows wrong count

**Solutions:**

a. Ensure notifications are fetched after relevant actions:

```javascript
// After posting a response
await responsesApi.createResponse(data);
fetchNotifications(); // Refresh notifications
```

b. Check notification polling in Header.jsx:

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    fetchNotificationCount();
  }, 30000); // Poll every 30 seconds

  return () => clearInterval(interval);
}, []);
```

c. Verify backend creates notifications correctly:

```bash
# Check notifications in database
mongosh
use peer-tutor-connect
db.notifications.find({ recipientId: ObjectId("...") })
```

#### 8. Images or Icons Not Loading

**Symptoms:**

- Lucide icons not appearing
- Static assets not loading
- 404 errors for images

**Solutions:**

a. Verify Lucide React import:

```javascript
import { Bell, LogOut } from "lucide-react"; // Named imports

<Bell className="w-6 h-6" />; // Use as component
```

b. Check static assets are in `public/` folder:

```
frontend/
├── public/
│   ├── logo.png
│   └── favicon.ico
```

c. Reference public assets with `/` prefix:

```jsx
<img src="/logo.png" alt="Logo" />
```

#### 9. Date Formatting Issues

**Symptoms:**

- Dates show as timestamps
- Timezone issues
- Date format inconsistent

**Solutions:**

a. Use date-fns for consistent formatting:

```javascript
import { formatDistanceToNow, format } from "date-fns";

// Relative time: "2 hours ago"
formatDistanceToNow(new Date(question.createdAt), { addSuffix: true });

// Formatted date: "Jan 5, 2025, 3:45 PM"
format(new Date(question.createdAt), "MMM d, yyyy, h:mm a");
```

b. Ensure dates are valid before formatting:

```javascript
const date = question.createdAt ? new Date(question.createdAt) : new Date();
```

#### 10. Form Submission Issues

**Symptoms:**

- Forms don't submit
- Input values not being sent
- Form validation errors

**Solutions:**

a. Prevent default form submission:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault(); // Must prevent default
  // ... submit logic
};
```

b. Ensure form state is updated:

```javascript
const [formData, setFormData] = useState({ title: "", content: "" });

<input
  value={formData.title}
  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
/>;
```

c. Check for empty required fields:

```javascript
if (!formData.title || !formData.content) {
  toast.error("Please fill in all required fields");
  return;
}
```

## Development Tips

### Best Practices

1. **Use React Context for global state** (auth, theme, etc.)
2. **Keep components small and focused** (single responsibility)
3. **Extract reusable logic into custom hooks**
4. **Use Tailwind utility classes** (avoid custom CSS unless necessary)
5. **Handle loading and error states gracefully**
6. **Test on multiple screen sizes** (mobile, tablet, desktop)
7. **Use semantic HTML** for accessibility (`<main>`, `<nav>`, `<button>`)
8. **Avoid inline styles** (use Tailwind classes instead)
9. **Use React Router's Link component** for internal navigation
10. **Keep API calls in separate module** (`src/api/api.js`)

### Performance Optimization

- Use React.memo() for expensive components
- Lazy load routes with React.lazy()
- Optimize images (use WebP format)
- Minimize bundle size by avoiding large dependencies
- Use Vite's code splitting features

### Accessibility Checklist

- All interactive elements have focus styles
- Images have alt text
- Forms have labels
- Color contrast meets WCAG AA (4.5:1)
- Keyboard navigation works for all features
- Screen reader announcements for dynamic content

## Production Deployment

### Build for Production

```bash
npm run build
```

This creates optimized static files in the `dist/` folder:

- Minified JavaScript
- Optimized CSS
- Code splitting
- Source maps

### Preview Production Build Locally

```bash
npm run preview
```

Serves the production build on `http://localhost:4173` for testing.

### Deployment Options

**1. Static Hosting (Vercel, Netlify, GitHub Pages)**

- Deploy `dist/` folder as static site
- Configure environment variables for production API URL
- Set up custom domain and SSL

**2. Docker Deployment**

- Create Dockerfile with multi-stage build
- Serve with Nginx or serve npm package
- Configure API proxy in production

**3. Backend Integration**

- Serve frontend from Express backend
- Build frontend and move `dist/` to backend `public/` folder
- Single deployment for both frontend and backend
