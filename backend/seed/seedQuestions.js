/**
 * Seed Questions
 * Creates course-relevant questions per course
 * CS545: 25 questions, CS590: 30 questions, SSW590: 20 questions
 * CS546: 20 questions, CS555: 15 questions
 */

import { getCollection, COLLECTIONS } from '../database_config/index.js';

/**
 * Course-specific question templates
 */
const questionTemplates = {
  CS545: [
    // Tidwell patterns
    {
      title: 'Understanding Tidwell design patterns for navigation',
      content:
        'I\'m reading Tidwell\'s UI patterns and I\'m confused about when to use "Hub and Spoke" vs "Pyramid" navigation patterns. Can someone explain the key differences?',
      isAnonymous: false,
    },
    {
      title: 'Tidwell\'s "Safe Exploration" pattern - how to implement?',
      content:
        'The Safe Exploration pattern sounds great in theory, but how do I actually implement it in my prototype? What specific UI elements support safe exploration?',
      isAnonymous: false,
    },

    // Laws of Simplicity
    {
      title: "John Maeda's Law of Reduce - how far is too far?",
      content:
        "I'm trying to simplify my design following Maeda's first law, but I'm worried I'm removing too much. How do I find the balance between minimal and usable?",
      isAnonymous: true,
    },
    {
      title: 'Laws of Simplicity - CONTEXT in practice',
      content:
        'The law about Context says "what lies in the periphery of simplicity is definitely not peripheral." Can someone give a concrete example of this in UI design?',
      isAnonymous: false,
    },
    {
      title: 'Organizing complexity vs hiding complexity',
      content:
        'Maeda talks about organizing and hiding complexity. When should I organize (show structure) vs hide (progressive disclosure)? Looking for practical guidelines.',
      isAnonymous: false,
    },

    // Microinteractions
    {
      title: 'Microinteractions - what counts as one?',
      content:
        'I\'m studying microinteractions but confused about the definition. Is a "like" button animation a microinteraction? What about a loading spinner?',
      isAnonymous: false,
    },
    {
      title: 'Trigger, Rules, Feedback, Loops - help with structure',
      content:
        'For microinteractions, I understand we need triggers, rules, feedback, and loops. Can someone walk through a simple example like a toggle switch with all four components?',
      isAnonymous: true,
    },
    {
      title: 'Designing feedback for microinteractions',
      content:
        'What makes good feedback in a microinteraction? Should it always be visual, or can sound/haptics work better in certain cases?',
      isAnonymous: false,
    },

    // PAR (Perception, Attention, Retention)
    {
      title: 'PAR framework - Perception principles question',
      content:
        "The PAR framework talks about perception. How does Gestalt's proximity principle apply to form design? Should related fields always be grouped together?",
      isAnonymous: false,
    },
    {
      title: 'Attention management in complex dashboards',
      content:
        "My dashboard has lots of data. Using PAR's attention principles, what techniques can I use to guide users to the most important information first?",
      isAnonymous: false,
    },
    {
      title: 'Retention in PAR - designing memorable interfaces',
      content:
        'How do I design for retention in PAR? What makes an interface memorable without being gimmicky?',
      isAnonymous: true,
    },
    {
      title: 'PAR and color coding - attention vs perception',
      content:
        "When using color to guide attention (PAR), how many distinct colors is too many? I've heard 5-7 but want to understand the reasoning.",
      isAnonymous: false,
    },

    // User Feedback
    {
      title: 'User feedback collection methods comparison',
      content:
        "What's the difference between think-aloud protocol and cognitive walkthrough for gathering user feedback? When should I use each one?",
      isAnonymous: false,
    },
    {
      title: 'Interpreting conflicting user feedback',
      content:
        "I got contradictory feedback from different users. One says the interface is too cluttered, another says it's too minimal. How do I decide which feedback to follow?",
      isAnonymous: true,
    },
    {
      title: 'Sample size for user feedback sessions',
      content:
        "How many users should I test with to get meaningful feedback? I've heard 5 users catch 80% of issues, but is that always true?",
      isAnonymous: false,
    },

    // Prototyping
    {
      title: 'Low-fi vs high-fi prototyping - when to transition?',
      content:
        'At what point should I move from low-fidelity to high-fidelity prototypes? Should I complete all user testing in low-fi first?',
      isAnonymous: false,
    },
    {
      title: 'Prototyping tools - Figma vs Balsamiq',
      content:
        'What are the tradeoffs between Figma and Balsamiq for prototyping? Which is better for different fidelity levels?',
      isAnonymous: false,
    },
    {
      title: 'Interactive vs static prototypes',
      content:
        'When is it worth the extra time to make an interactive prototype vs just static mockups? What kinds of insights do interactive prototypes provide?',
      isAnonymous: true,
    },

    // Paper Prototyping
    {
      title: 'Paper prototyping for mobile apps - best approach?',
      content:
        'How do I create effective paper prototypes for a mobile app? Should I draw individual screens or create a continuous scroll?',
      isAnonymous: false,
    },
    {
      title: 'Testing interactions with paper prototypes',
      content:
        'How do I simulate dynamic interactions like drag-and-drop or swiping in paper prototypes? Just verbally explain or prepare multiple paper states?',
      isAnonymous: false,
    },
    {
      title: 'Paper prototyping - materials and setup',
      content:
        "What materials work best for paper prototyping? I've seen people use sticky notes, index cards, and sketches. What are the pros/cons?",
      isAnonymous: false,
    },

    // Wireframing
    {
      title: 'Wireframe annotation best practices',
      content:
        'How detailed should my wireframe annotations be? Should I document every interaction or just the key flows?',
      isAnonymous: true,
    },
    {
      title: 'Wireframes vs mockups - clarity on difference',
      content:
        'What exactly differentiates a wireframe from a mockup? Is it just the level of visual detail, or is there more to it?',
      isAnonymous: false,
    },
    {
      title: 'Wireframing tools and standards',
      content:
        'Are there standard symbols or notations for wireframes? Like how flowcharts have standard shapes, do wireframes have conventions?',
      isAnonymous: false,
    },
    {
      title: 'Content hierarchy in wireframes',
      content:
        'How do I show content hierarchy and importance in black-and-white wireframes without using color? What visual techniques work?',
      isAnonymous: false,
    },
  ],

  CS590: [
    // Big O, Theta, Omega
    {
      title: 'Big O vs Big Theta - practical difference',
      content:
        'I understand Big O is upper bound, but when should I use Big Theta instead? Is Big Theta just more precise?',
      isAnonymous: false,
    },
    {
      title: 'Big Omega notation - when is it useful?',
      content:
        'Big Omega gives lower bound, but I rarely see it used. When would I need to know the best-case complexity with Big Omega?',
      isAnonymous: true,
    },
    {
      title: 'Tight bounds vs loose bounds in Big O',
      content:
        'If an algorithm is O(n log n), is it also O(n²)? Why do we prefer tight bounds?',
      isAnonymous: false,
    },

    // Iterative Analysis
    {
      title: 'Analyzing nested loops - is it always O(n²)?',
      content:
        "I have two nested loops but the inner loop doesn't always run n times. How do I analyze this? Is it still O(n²)?",
      isAnonymous: false,
    },
    {
      title: 'Loop analysis with decreasing iterations',
      content:
        'My loop counter decreases by half each iteration (i = i/2). How do I analyze this? Is it logarithmic?',
      isAnonymous: false,
    },

    // Recursive Analysis
    {
      title: 'Recurrence relation setup - how to start?',
      content:
        "How do I write the recurrence relation for a recursive algorithm? What's the step-by-step process?",
      isAnonymous: true,
    },
    {
      title: 'Substitution method for solving recurrences',
      content:
        "I'm trying to use the substitution method but I don't know what to guess. How do I make an educated guess for the solution?",
      isAnonymous: false,
    },

    // Master Theorem
    {
      title: 'Master theorem - when can I apply it?',
      content:
        'What are the conditions for using the Master Theorem? I have T(n) = 2T(n/2) + n log n - does it apply here?',
      isAnonymous: false,
    },
    {
      title: 'Master theorem three cases - which one applies?',
      content:
        "How do I determine which case of the Master Theorem applies? I'm confused about comparing f(n) with n^(log_b a).",
      isAnonymous: false,
    },

    // Recursion Tree
    {
      title: 'Drawing recursion trees - systematic approach',
      content:
        "What's the systematic way to draw a recursion tree? Should I expand all nodes or just show the pattern?",
      isAnonymous: true,
    },
    {
      title: 'Summing costs in recursion tree',
      content:
        'Once I have my recursion tree drawn, how do I sum up the costs at each level? Do I need to sum all levels or look for a pattern?',
      isAnonymous: false,
    },

    // Searching Algorithms
    {
      title: 'Binary search implementation - mid calculation',
      content:
        'For binary search, should I use mid = (low + high) / 2 or mid = low + (high - low) / 2? Does it matter?',
      isAnonymous: false,
    },
    {
      title: 'When is linear search better than binary search?',
      content:
        'Are there scenarios where linear search is actually preferable to binary search? Or is binary search always better for searching?',
      isAnonymous: false,
    },

    // Sorting Algorithms
    {
      title: 'Quicksort pivot selection strategies',
      content:
        'How does pivot selection affect quicksort performance? What are the common pivot selection strategies and their tradeoffs?',
      isAnonymous: true,
    },
    {
      title: 'Merge sort vs quicksort - when to use which?',
      content:
        'Both are O(n log n), so how do I choose between merge sort and quicksort? What are the practical differences?',
      isAnonymous: false,
    },
    {
      title: 'Stable vs unstable sorting',
      content:
        'What does it mean for a sort to be stable? Why would I care about stability in practice?',
      isAnonymous: false,
    },

    // Trees
    {
      title: 'Binary tree vs binary search tree',
      content:
        "What's the defining difference between a binary tree and a BST? Is it just the ordering property?",
      isAnonymous: false,
    },
    {
      title: 'Tree traversal - inorder vs preorder vs postorder',
      content:
        'When would I use inorder vs preorder vs postorder traversal? Are there specific use cases for each?',
      isAnonymous: false,
    },

    // AVL Trees
    {
      title: 'AVL tree rotations - left vs right',
      content:
        "I'm confused about when to do left rotation vs right rotation in AVL trees. Is there a simple rule to determine which one?",
      isAnonymous: true,
    },
    {
      title: 'AVL balance factor calculation',
      content:
        'How do I calculate the balance factor for AVL trees? Is it left height minus right height, or right minus left?',
      isAnonymous: false,
    },

    // Graphs
    {
      title: 'Graph representation - adjacency matrix vs list',
      content:
        'When should I use an adjacency matrix vs adjacency list for representing graphs? What are the tradeoffs?',
      isAnonymous: false,
    },
    {
      title: 'DFS vs BFS - when to use which?',
      content:
        'What are the practical differences between DFS and BFS? When would I choose one over the other?',
      isAnonymous: false,
    },
    {
      title: 'Dijkstra algorithm - negative weights question',
      content:
        "Why doesn't Dijkstra's algorithm work with negative edge weights? What goes wrong?",
      isAnonymous: true,
    },

    // Hashing
    {
      title: 'Hash function design principles',
      content:
        'What makes a good hash function? Should I focus on speed or on minimizing collisions?',
      isAnonymous: false,
    },
    {
      title: 'Collision resolution - chaining vs open addressing',
      content:
        'What are the pros and cons of chaining vs open addressing for collision resolution? Which is better in practice?',
      isAnonymous: false,
    },

    // Priority Queues
    {
      title: 'Priority queue implementation - heap vs BST',
      content:
        'Can I implement a priority queue with a BST instead of a heap? What would be the complexity tradeoffs?',
      isAnonymous: false,
    },

    // Dynamic Programming
    {
      title: 'DP vs greedy algorithms - identifying approach',
      content:
        'How do I know if a problem needs dynamic programming or if a greedy approach will work? What characteristics should I look for?',
      isAnonymous: true,
    },
    {
      title: 'Memoization vs tabulation in DP',
      content:
        "What's the difference between memoization (top-down) and tabulation (bottom-up) in DP? When should I use each?",
      isAnonymous: false,
    },
    {
      title: 'Identifying overlapping subproblems',
      content:
        'How do I recognize if a problem has overlapping subproblems? Is this the key indicator that I should use DP?',
      isAnonymous: false,
    },

    // NP Class & Backtracking
    {
      title: 'P vs NP - practical implications',
      content:
        'What does it mean practically when a problem is NP-complete? Should I just give up on finding an efficient solution?',
      isAnonymous: false,
    },
    {
      title: 'NP-hard vs NP-complete clarification',
      content:
        "What's the difference between NP-hard and NP-complete? I keep mixing them up.",
      isAnonymous: true,
    },
    {
      title: 'Backtracking vs brute force',
      content:
        'Is backtracking just fancy brute force, or is there a fundamental difference? When should I use backtracking?',
      isAnonymous: false,
    },
  ],

  SSW590: [
    // Kanban
    {
      title: 'Kanban WIP limits - how to determine the right number',
      content:
        'How do I decide on the right WIP (Work in Progress) limit for each column in our Kanban board? Is there a formula or is it trial and error?',
      isAnonymous: false,
    },
    {
      title: 'Kanban vs Scrum - key differences',
      content:
        'What are the fundamental differences between Kanban and Scrum? When would I choose Kanban over Scrum?',
      isAnonymous: true,
    },
    {
      title: 'Kanban metrics - cycle time vs lead time',
      content:
        "I'm confused about cycle time and lead time in Kanban. What's the difference and which one should I focus on optimizing?",
      isAnonymous: false,
    },

    // Docker
    {
      title: 'Dockerfile CMD vs ENTRYPOINT',
      content:
        "What's the difference between CMD and ENTRYPOINT in a Dockerfile? When should I use one over the other?",
      isAnonymous: false,
    },
    {
      title: 'Docker image layers - optimizing build times',
      content:
        'How do Docker layers work? What order should I put commands in my Dockerfile to maximize caching and speed up builds?',
      isAnonymous: false,
    },
    {
      title: 'Docker networking - bridge vs host mode',
      content:
        "What's the difference between bridge and host network mode in Docker? When would I use each one?",
      isAnonymous: true,
    },
    {
      title: 'Docker volumes vs bind mounts',
      content:
        'When should I use Docker volumes vs bind mounts for persisting data? What are the tradeoffs?',
      isAnonymous: false,
    },

    // Cloud
    {
      title: 'IaaS vs PaaS vs SaaS - practical examples',
      content:
        'Can someone explain IaaS, PaaS, and SaaS with concrete examples? I understand the theory but want real-world cases.',
      isAnonymous: false,
    },
    {
      title: 'Cloud deployment strategies - blue-green vs canary',
      content:
        "What's the difference between blue-green and canary deployments? Which one is safer for production?",
      isAnonymous: false,
    },

    // Containers vs VMs
    {
      title: 'Containers vs VMs - performance differences',
      content:
        "Why are containers faster to start than VMs? What's the fundamental architectural difference?",
      isAnonymous: true,
    },
    {
      title: 'When to use VMs instead of containers',
      content:
        'Are there scenarios where VMs are better than containers? Or are containers always the better choice?',
      isAnonymous: false,
    },

    // Phoenix Project
    {
      title: 'Phoenix Project - The Three Ways explained',
      content:
        'Can someone explain the Three Ways from The Phoenix Project in simple terms? I get the concepts but want concrete examples.',
      isAnonymous: false,
    },
    {
      title: 'Four types of work from Phoenix Project',
      content:
        'The Phoenix Project mentions four types of work. How do I categorize my current work items into these four types?',
      isAnonymous: false,
    },
    {
      title: 'Phoenix Project - applying to small teams',
      content:
        'The Phoenix Project focuses on large enterprises. How do the principles apply to small 5-person teams?',
      isAnonymous: true,
    },

    // The Three Ways
    {
      title: 'First Way - systems thinking in practice',
      content:
        'How do I apply the First Way (systems thinking) to our DevOps workflow? What does it look like in day-to-day operations?',
      isAnonymous: false,
    },
    {
      title: 'Second Way - amplifying feedback loops',
      content:
        'What are practical ways to amplify feedback loops (Second Way) in our deployment pipeline?',
      isAnonymous: false,
    },
    {
      title: 'Third Way - culture of experimentation',
      content:
        'How do I foster a culture of experimentation (Third Way) when our team is risk-averse and afraid of breaking things?',
      isAnonymous: false,
    },

    // Toyota Kata
    {
      title: 'Toyota Kata - improvement kata vs coaching kata',
      content:
        "What's the difference between improvement kata and coaching kata in Toyota Kata? How do they work together?",
      isAnonymous: true,
    },
    {
      title: 'PDCA cycle in Toyota Kata',
      content:
        'How does the PDCA (Plan-Do-Check-Act) cycle fit into Toyota Kata? Is it the same as the improvement kata?',
      isAnonymous: false,
    },
    {
      title: 'Applying Toyota Kata to DevOps',
      content:
        'How do I apply Toyota Kata principles to improving our CI/CD pipeline? What would be a good first target condition?',
      isAnonymous: false,
    },
  ],

  CS546: [
    // HTML Basics
    {
      title: 'Semantic HTML - when to use section vs div',
      content:
        "What's the practical difference between <section>, <article>, and <div>? When should I use each one?",
      isAnonymous: false,
    },
    {
      title: 'HTML forms - GET vs POST method',
      content:
        'When should I use GET vs POST for form submission? Is there a security difference?',
      isAnonymous: true,
    },

    // CSS
    {
      title: 'CSS Flexbox vs Grid - when to use which',
      content:
        "I'm confused about when to use Flexbox vs Grid for layouts. Are there specific use cases for each?",
      isAnonymous: false,
    },
    {
      title: 'CSS specificity calculation',
      content:
        'How does CSS specificity work? Why is my class style being overridden by a different rule?',
      isAnonymous: false,
    },
    {
      title: 'CSS positioning - relative vs absolute',
      content:
        "What's the difference between position: relative and position: absolute? When should I use each one?",
      isAnonymous: false,
    },

    // JavaScript
    {
      title: 'JavaScript var vs let vs const',
      content:
        'What are the practical differences between var, let, and const? Should I just always use const?',
      isAnonymous: true,
    },
    {
      title: 'JavaScript closures - simple explanation',
      content:
        "Can someone explain closures in simple terms? I understand the syntax but not when I'd use them.",
      isAnonymous: false,
    },
    {
      title: 'JavaScript this keyword behavior',
      content:
        'Why does "this" behave differently in arrow functions vs regular functions? It\'s causing bugs in my code.',
      isAnonymous: false,
    },

    // ES6 Modules
    {
      title: 'ES6 import vs require',
      content:
        "What's the difference between ES6 import/export and require/module.exports? Can I mix them in the same project?",
      isAnonymous: false,
    },
    {
      title: 'Default export vs named exports',
      content:
        'When should I use default exports vs named exports in ES6 modules? What are the tradeoffs?',
      isAnonymous: true,
    },

    // Error Handling in Node
    {
      title: 'Node.js error handling - try-catch vs .catch()',
      content:
        'When should I use try-catch blocks vs .catch() for error handling in Node? Is there a difference?',
      isAnonymous: false,
    },
    {
      title: 'Handling errors in Express middleware',
      content:
        'How do I properly handle errors in Express middleware? Should I use next(err) or throw?',
      isAnonymous: false,
    },

    // Express
    {
      title: 'Express middleware execution order',
      content:
        'How does Express determine the order of middleware execution? Why does order matter so much?',
      isAnonymous: false,
    },
    {
      title: 'Express app.use() vs app.get()',
      content:
        "What's the difference between app.use() and app.get() in Express? When should I use each one?",
      isAnonymous: true,
    },

    // Async/Await
    {
      title: 'Async/await vs Promises - which to use',
      content:
        'Should I use async/await or .then() chains with Promises? Is one better than the other?',
      isAnonymous: false,
    },
    {
      title: 'Error handling with async/await',
      content:
        'How do I properly handle errors when using async/await? Do I need try-catch for every await?',
      isAnonymous: false,
    },

    // MongoDB
    {
      title: 'MongoDB findOne vs find',
      content:
        "What's the difference between findOne() and find() in MongoDB? When should I use each?",
      isAnonymous: false,
    },
    {
      title: 'MongoDB ObjectId vs string ID',
      content:
        "Should I use MongoDB's ObjectId or string IDs for my documents? What are the pros and cons?",
      isAnonymous: true,
    },

    // User Authentication
    {
      title: 'Password hashing - bcrypt salt rounds',
      content:
        "How many salt rounds should I use for bcrypt password hashing? What's the tradeoff between security and performance?",
      isAnonymous: false,
    },
    {
      title: 'Session-based auth vs JWT',
      content:
        'What are the differences between session-based authentication and JWT? Which is more secure?',
      isAnonymous: false,
    },

    // Handlebars
    {
      title: 'Handlebars helpers - when to use them',
      content:
        'When should I create custom Handlebars helpers? What kinds of logic belong in helpers vs in my routes?',
      isAnonymous: false,
    },
  ],

  CS555: [
    // Sprint Planning & Estimation
    {
      title: 'Sprint planning - how to estimate story points',
      content:
        "Our team is struggling with story point estimation. We're all over the place. What's the best way to reach consensus?",
      isAnonymous: false,
    },
    {
      title: 'Velocity calculation and sprint planning',
      content:
        'How do I use team velocity from previous sprints to plan the next sprint? Should I always commit to the average velocity?',
      isAnonymous: true,
    },
    {
      title: 'Story points vs hours - which to use',
      content:
        'What are the advantages of story points over hours for estimation? Why not just estimate in hours?',
      isAnonymous: false,
    },

    // User Stories
    {
      title: 'User stories - acceptance criteria best practices',
      content:
        'How detailed should acceptance criteria be in user stories? Should they include every edge case?',
      isAnonymous: false,
    },
    {
      title: 'Epic vs user story - clear distinction',
      content:
        'What makes something an epic vs a user story? Is it just size, or is there more to it?',
      isAnonymous: false,
    },

    // Daily Standups
    {
      title: 'Daily standup - what to report',
      content:
        "I know the three questions, but how detailed should my answers be? Sometimes I feel like I'm rambling or being too vague.",
      isAnonymous: true,
    },
    {
      title: 'Dealing with blockers in standup',
      content:
        'When I mention a blocker in standup, should we discuss it then or take it offline? How long should standups take?',
      isAnonymous: false,
    },

    // Retrospectives
    {
      title: 'Retrospective formats beyond Start-Stop-Continue',
      content:
        "We've done Start-Stop-Continue for three sprints and it's getting stale. What other retrospective formats work well?",
      isAnonymous: false,
    },
    {
      title: 'Making retrospective action items stick',
      content:
        'We identify improvements in retrospectives but never implement them. How do we ensure action items get done?',
      isAnonymous: false,
    },

    // Definition of Done
    {
      title: 'Definition of Done - what should it include',
      content:
        'What are essential items for a Definition of Done? Ours feels either too strict or too loose.',
      isAnonymous: true,
    },
    {
      title: 'Adjusting Definition of Done mid-sprint',
      content:
        "Can we adjust our DoD mid-sprint if we realize it's too strict? Or should we wait until the retrospective?",
      isAnonymous: false,
    },

    // Scrum Roles
    {
      title: 'Product Owner vs Scrum Master - role clarity',
      content:
        "What's the key difference between Product Owner and Scrum Master responsibilities? Can one person do both?",
      isAnonymous: false,
    },
    {
      title: 'Product backlog prioritization techniques',
      content:
        'As Product Owner, how should I prioritize the backlog? Is it just business value, or are there other factors?',
      isAnonymous: false,
    },

    // Agile Principles
    {
      title: 'Responding to change vs following a plan',
      content:
        'The Agile Manifesto values responding to change, but how do I balance this with stakeholder expectations for predictability?',
      isAnonymous: true,
    },
    {
      title: 'Working software over documentation - limits?',
      content:
        "Agile values working software over documentation, but when is documentation actually necessary? What's the minimum?",
      isAnonymous: false,
    },
  ],
};

/**
 * Generates random date within the last 7 days
 */
const getRandomRecentDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7);
  const hoursAgo = Math.floor(Math.random() * 24);
  return new Date(
    now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000
  );
};

/**
 * Seeds questions for all courses
 */
export const seedQuestions = async (courseIds, studentIds) => {
  try {
    const questionsCollection = getCollection(COLLECTIONS.QUESTIONS);
    const coursesCollection = getCollection(COLLECTIONS.COURSES);

    // Clear existing questions
    await questionsCollection.deleteMany({});

    const allQuestions = [];

    // For each course, create questions
    for (const courseId of courseIds) {
      // Get course details to find its code
      const course = await coursesCollection.findOne({ _id: courseId });
      const courseCode = course.courseCode;

      // Get templates for this course
      const templates = questionTemplates[courseCode] || [];

      // Get students enrolled in this course
      const enrolledStudents = course.enrolledStudents || [];

      if (enrolledStudents.length === 0) {
        console.log(
          `No students enrolled in ${courseCode}, skipping questions`
        );
        continue;
      }

      // Create questions from templates
      for (const template of templates) {
        // Pick random enrolled student as poster
        const randomIndex = Math.floor(Math.random() * enrolledStudents.length);
        const posterId = enrolledStudents[randomIndex];

        const question = {
          courseId,
          posterId,
          title: template.title,
          content: template.content,
          isAnonymous: template.isAnonymous,
          isResolved: Math.random() > 0.7, // 30% chance of being resolved
          createdAt: getRandomRecentDate(),
          updatedAt: getRandomRecentDate(),
        };

        allQuestions.push(question);
      }
    }

    if (allQuestions.length > 0) {
      const result = await questionsCollection.insertMany(allQuestions);
      console.log(
        `Seeded ${result.insertedCount} questions across all courses`
      );
      console.log(`   - CS545: 25 questions (HCI topics)`);
      console.log(`   - CS590: 30 questions (Algorithms topics)`);
      console.log(`   - SSW590: 20 questions (DevOps topics)`);
      console.log(`   - CS546: 20 questions (Web Dev topics)`);
      console.log(`   - CS555: 15 questions (Agile topics)`);
      return Object.values(result.insertedIds);
    } else {
      console.log('No questions to seed');
      return [];
    }
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
};
