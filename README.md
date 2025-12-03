# Peer-Tutor Connect

A web-based peer tutoring platform that connects students for instant academic help within their enrolled courses. Built as part of the CS545 Human-Computer Interaction course project.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Quick Start Guide](#quick-start-guide)
- [Academic Context](#academic-context)
- [References](#references)

## Project Description

Peer-Tutor Connect is a web application that enables real-time peer-to-peer academic help within course-specific discussion forums. Students in online courses frequently encounter learning blockers and face 24-48 hour delays when reaching out through traditional methods like emails, Canvas messages, or waiting for office hours, particularly during times when traditional help is unavailable (evenings, weekends, holidays). Our platform solves this by providing instant access to classmates who can answer questions and explain concepts, with course forums automatically available after login based on enrollment and an optional anonymous posting feature for students who feel uncomfortable asking questions publicly. [Watch Demo Video](https://youtu.be/LSd3l9PawvI)

### Key Features

- Discussion-style interface where students post questions and peers provide responses in threaded conversations
- Browse existing questions to find solutions that helped other students with similar problems
- Mark helpful responses and resolve questions once the issue is fixed
- Optional anonymity removes the fear of judgment when asking basic or conceptual questions
- Real-time notifications when someone responds to your question

### Primary Usability Focus: Efficiency

Our primary focus is improving the efficiency of getting academic help. Our goal is to reduce the time students spend waiting for academic help from 24-48 hours to under 30 minutes.

**Quantitative Metrics**

| Metric                 | Description                                                                   | Target                  |
| ---------------------- | ----------------------------------------------------------------------------- | ----------------------- |
| Task completion time   | Average time from posting a question to receiving a satisfactory answer       | 30 minutes or less      |
| First response time    | How quickly questions receive their first response                            | 10 minutes or less      |
| Interaction efficiency | Number of back-and-forth exchanges needed to fully resolve a learning blocker | 3 or fewer interactions |

**Qualitative Metrics**

| Metric            | Description                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| User Satisfaction | Post-session feedback comparing the platform's efficiency against traditional support channels students currently use |

## Tech Stack

| Layer              | Technology                                           |
| ------------------ | ---------------------------------------------------- |
| **Frontend**       | React 19, Vite, Tailwind CSS v4, React Router, Axios |
| **Backend**        | Node.js, Express.js v5, MongoDB (native driver)      |
| **Authentication** | express-session, bcrypt                              |
| **Testing**        | Jest, Supertest (184 tests)                          |

## Quick Start Guide

### Prerequisites

- Node.js v24.11.1 or higher
- MongoDB v7.0 or higher

### Setup

```bash
# Clone the repository
git clone https://github.com/kspriyanka14/CS545-Peer-Tutor-Connect.git
cd CS545-Peer-Tutor-Connect

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection and session secret
npm run seed    # Populate database with sample data
npm start       # Starts on http://localhost:3000

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev     # Starts on http://localhost:5173
```

### Demo Credentials

After seeding, log in with any of the 100 student accounts. All use the same password.

- **Email:** `aditi.sharma@stevens.edu`
- **Password:** `password123`

### Detailed Documentation

- [Frontend README](frontend/README.md) for components, styling, API integration, and troubleshooting
- [Backend README](backend/README.md) for database schema, API endpoints, environment setup, and testing

## Academic Context

**Course:** CS 545, Human-Computer Interaction

**Instructor:** Dr. Gregg Vesonder

**Team:**

- Vishnu Vardhan Putta
- Priyanka Kavali Subramanyam
- Saylee Mangesh Waje

### Design Process

We followed an iterative, user-centered design approach with testing at each fidelity level:

| Prototype          | Description                                                                 | Users Tested |
| ------------------ | --------------------------------------------------------------------------- | ------------ |
| Low-fidelity       | Paper prototype with hand-drawn screens to test navigation flow             | 3            |
| Medium-fidelity    | Figma prototype with interactive mockups and visual design                  | 3            |
| High-fidelity (v1) | Working code with search, filter, and sort capabilities                     | 10           |
| High-fidelity (v2) | Iteration based on v1 feedback with compact layouts and improved help guide | 10           |
| High-fidelity (v3) | Final iteration with new question badges and reset filters button           | 8            |

Each round of testing informed the next iteration. Feedback was collected through post-session surveys following Frary's guidelines for questionnaire design.

### Accessibility (WCAG 2.2 AAA)

The application meets WCAG 2.2 AAA guidelines, the strictest accessibility standard. We verified compliance using three tools:

1. **Chrome DevTools Lighthouse** is Google's built-in accessibility auditor powered by axe-core. All pages scored 100/100. We also used the built-in vision deficiency simulations (protanopia, deuteranopia, tritanopia, achromatopsia, blurred vision, reduced contrast) to manually verify the interface remained usable.

2. **axe DevTools** is Deque's browser extension for detailed WCAG 2.2 AAA testing. Zero issues found across all views.

3. **macOS VoiceOver** is Apple's built-in screen reader. We used it for manual testing of keyboard navigation, focus management, and screen reader announcements.

### Additional Evaluations

#### PAR Review

- **Perception:** Interface groups information logically (course dashboards, consistent card layouts, visual hierarchy)
- **Attention:** Bold Post Question button, visible Reply buttons, helpful response indicators, Answered badges, new question count badges, breathing notification badge
- **Retention:** Familiar discussion forum patterns, minimal steps, consistent interactions, breadcrumbs, help widget

#### Heuristic Evaluation

| Nielsen Heuristic                   | What We Did                                                                          |  ✓  |
| ----------------------------------- | ------------------------------------------------------------------------------------ | :-: |
| Visibility of System Status         | Toast notifications, loading spinners, breathing notification badge                  |  ✓  |
| Match Between System and Real World | Forum layout mirrors familiar platforms, natural language, recognizable course codes |  ✓  |
| User Control and Freedom            | Edit/delete content, toggle anonymous, cancel actions, breadcrumbs                   |  ✓  |
| Consistency and Standards           | Uniform buttons, cards, colors, wording; responsive design                           |  ✓  |
| Error Prevention                    | Form validation, real-time character counts, delete confirmation                     |  ✓  |
| Recognition Rather Than Recall      | Breadcrumbs, dashboard course cards, help widget, visual cues                        |  ✓  |
| Flexibility and Efficiency of Use   | Ctrl+Enter shortcuts, multiple paths, sort/filter, new question badges               |  ✓  |
| Aesthetic and Minimalist Design     | Only relevant info per page, proper spacing, clear hierarchy                         |  ✓  |
| Help Users Recognize Errors         | Specific error messages, real-time counters, editable content                        |  ✓  |
| Help and Documentation              | Floating help widget always accessible                                               |  ✓  |

#### Laws of Simplicity

- **Time:** Reduced wait from 24-48 hours to 81 seconds. Merged pages, added search/filter/sort. New question badges cut response time by 71%.
- **Organize:** Course-specific dashboards following SLIP (Sort, Label, Integrate, Prioritize).
- **Learn:** Built on familiar discussion forum patterns; users navigated without confusion.
- **Reduce:** Merged redundant pages, minimized navigation with badges, kept features essential only.

#### Microinteractions

- **Scroll to Top Button:** Appears after 300px scroll, smooth scrolls to top
- **Toast Notifications:** Color-coded messages (1.5-3s), auto-dismiss
- **Real-time Character Counts:** Updates per keystroke, turns red when exceeded
- **Form Validation Feedback:** Red borders, specific error messages
- **Notification Badge:** Red pulsing animation on bell icon
- **Delete Confirmation Modal:** Prevents accidental deletions
- **Button Hover Effects:** Color shifts, scaling, shadows

## References

- [EDUCAUSE 2023 Students and Technology Report](https://www.educause.edu/ecar/research-publications/2023/students-and-technology-report-flexibility-choice-and-equity-in-the-student-experience/introduction-and-key-findings)
- [Knack Peer Tutoring Platform](https://www.joinknack.com/)
- [Grand View Research - Online Tutoring Services Market](https://www.grandviewresearch.com/industry-analysis/online-tutoring-services-market)
- [Chrome Lighthouse](https://developer.chrome.com/docs/lighthouse)
- [Deque axe DevTools](https://www.deque.com/axe/browser-extensions/)
- [Nielsen Norman Group - 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [John Maeda - The Laws of Simplicity](https://lawsofsimplicity.com/)
