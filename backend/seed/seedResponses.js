/**
 * Seed Responses
 * Creates 1-5 helpful responses per question
 */

import { getCollection, COLLECTIONS } from '../database_config/index.js';

/**
 * Generic helpful response templates
 */
const responseTemplates = [
  {
    content:
      "I had the same issue! Here's what worked for me: {solution}. Hope this helps!",
    isAnonymous: false,
  },
  {
    content:
      'Great question! The key difference is {explanation}. Try thinking about it from this angle: {example}.',
    isAnonymous: false,
  },
  {
    content:
      'I just finished this assignment. The professor mentioned in lecture that {hint}. That should point you in the right direction.',
    isAnonymous: false,
  },
  {
    content:
      'Check out {resource} - it has a really clear explanation. Also, the textbook chapter {number} covers this in detail.',
    isAnonymous: true,
  },
  {
    content:
      'I struggled with this too. What helped me was {approach}. Also, make sure you {tip}.',
    isAnonymous: false,
  },
  {
    content:
      "Have you tried {suggestion}? That's usually the cause of this type of issue. Let me know if that works!",
    isAnonymous: false,
  },
  {
    content:
      'The TA went over this in the review session. Basically, {summary}. Does that make sense?',
    isAnonymous: true,
  },
  {
    content:
      "I think you're on the right track! One thing to watch out for is {warning}. Otherwise your approach looks good.",
    isAnonymous: false,
  },
];

/**
 * Specific helpful responses for common question patterns
 */
const specificResponses = {
  heuristic:
    "Recognition rather than recall means users shouldn't have to remember information from one part of the interface to another - everything they need should be visible. Consistency means using the same patterns throughout. Example: if you use blue for all action buttons, don't suddenly use green.",
  figma:
    'In Figma, create a component with variants for default and hover states. Then in prototype mode, select your button and add an interaction: "While Hovering" → "Change to" → select your hover variant. Make sure both variants are in the same component!',
  'user testing':
    "It's 8+ users total across your team for each iteration. You CAN reuse some users between iterations (like 50%), but you should also bring in fresh perspectives. Document who tested and when.",
  accessibility:
    'Use WAVE and Lighthouse as starting points. For WCAG AA compliance, you should test with at least one screen reader (NVDA is free). Also test keyboard navigation - can you use your entire site with just Tab, Enter, and arrow keys?',
  'dynamic programming':
    'Use DP when the problem has overlapping subproblems and optimal substructure. Greedy works when local optimal choices lead to global optimum. For 0/1 knapsack use DP, for fractional knapsack use greedy.',
  'binary search':
    "Your mid calculation can overflow! Use mid = low + (high - low) / 2 instead. Also make sure you're updating low and high correctly: if arr[mid] < target, set low = mid + 1, not low = mid.",
  docker:
    'Don\'t use localhost inside containers! Use the service name from docker-compose.yml. If your backend service is called "api", your frontend should call http://api:3000, not http://localhost:3000.',
  middleware:
    'Order matters! Put body-parser and CORS before routes, error handler after routes. General pattern: app.use(cors) → app.use(bodyParser) → app.use(routes) → app.use(errorHandler).',
  'sprint planning':
    'Use planning poker! Each person shows their estimate simultaneously, then discuss the highest and lowest estimates. After discussion, vote again. Usually converges in 2-3 rounds.',
  mongodb:
    'Aggregation pipeline: db.collection.aggregate([{$lookup: {from: "othercollection", localField: "_id", foreignField: "foreignId", as: "joined"}}, {$match: {yourFilter}}]). Each stage passes results to the next.',
};

/**
 * Generates a contextual response based on question content
 */
const generateContextualResponse = (question) => {
  const lowerContent =
    question.content.toLowerCase() + ' ' + question.title.toLowerCase();

  // Check for specific patterns
  for (const [pattern, response] of Object.entries(specificResponses)) {
    if (lowerContent.includes(pattern)) {
      return response;
    }
  }

  // Fall back to generic template
  const template =
    responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
  return template.content
    .replace('{solution}', 'making sure all your steps are correct')
    .replace('{explanation}', 'in how you approach the problem')
    .replace('{example}', 'consider a simpler case first')
    .replace('{resource}', 'the course slides')
    .replace('{number}', Math.floor(Math.random() * 10) + 1)
    .replace('{approach}', 'breaking it down into smaller parts')
    .replace('{tip}', 'test your code with edge cases')
    .replace('{suggestion}', 'checking your syntax carefully')
    .replace('{warning}', 'edge cases and null values')
    .replace('{summary}', 'you need to consider all possibilities')
    .replace('{hint}', 'this is covered in the readings');
};

/**
 * Generates random date after a given date
 */
const getRandomDateAfter = (afterDate) => {
  const after = new Date(afterDate);
  const now = new Date();
  const range = now.getTime() - after.getTime();
  const randomTime = after.getTime() + Math.floor(Math.random() * range);
  return new Date(randomTime);
};

/**
 * Seeds responses for all questions
 */
export const seedResponses = async (questionIds, studentIds) => {
  try {
    const responsesCollection = getCollection(COLLECTIONS.RESPONSES);
    const questionsCollection = getCollection(COLLECTIONS.QUESTIONS);

    // Clear existing responses
    await responsesCollection.deleteMany({});

    const allResponses = [];

    // For each question, create 0-20 responses
    for (const questionId of questionIds) {
      const question = await questionsCollection.findOne({ _id: questionId });

      if (!question) continue;

      // Random number of responses (0-20)
      const numResponses = Math.floor(Math.random() * 21);

      // Get list of students who could respond (exclude question poster)
      const potentialResponders = studentIds.filter(
        (id) => id.toString() !== question.posterId.toString()
      );

      if (potentialResponders.length === 0) continue;

      for (let i = 0; i < numResponses; i++) {
        // Pick random student as responder
        const randomIndex = Math.floor(
          Math.random() * potentialResponders.length
        );
        const posterId = potentialResponders[randomIndex];

        // Generate contextual response
        const content = generateContextualResponse(question);

        // First response has 50% chance of being marked helpful if question is resolved
        const isHelpful = question.isResolved && i === 0 && Math.random() > 0.5;

        const response = {
          questionId,
          posterId,
          content,
          isAnonymous: Math.random() > 0.8, // 20% chance of anonymous
          isHelpful,
          createdAt: getRandomDateAfter(question.createdAt),
          updatedAt: getRandomDateAfter(question.createdAt),
        };

        allResponses.push(response);
      }
    }

    if (allResponses.length > 0) {
      const result = await responsesCollection.insertMany(allResponses);
      console.log(
        `Seeded ${result.insertedCount} responses across all questions`
      );
      return Object.values(result.insertedIds);
    } else {
      console.log('No responses to seed');
      return [];
    }
  } catch (error) {
    console.error('Error seeding responses:', error);
    throw error;
  }
};
