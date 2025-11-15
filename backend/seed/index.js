/**
 * Main Seed Script
 * Orchestrates seeding of all collections
 */

import { connectToDb, closeConnection } from '../database_config/index.js';
import { seedCourses } from './seedCourses.js';
import { seedStudents } from './seedStudents.js';
import { seedQuestions } from './seedQuestions.js';
import { seedResponses } from './seedResponses.js';

const runSeed = async () => {
  try {
    console.log('Starting database seeding...\n');

    // Connect to database
    await connectToDb();

    // Seed in order (courses → students → questions → responses)
    console.log('Seeding courses...');
    const courseIds = await seedCourses();

    console.log('\nSeeding students...');
    const studentIds = await seedStudents(courseIds);

    console.log('\nSeeding questions...');
    const questionIds = await seedQuestions(courseIds, studentIds);

    console.log('\nSeeding responses...');
    await seedResponses(questionIds, studentIds);

    console.log('\nSeeding completed successfully!');
    console.log('\nSummary:');
    console.log(`   - Courses: ${courseIds.length}`);
    console.log(`   - Students: ${studentIds.length}`);
    console.log(`   - Questions: ${questionIds.length}`);
    console.log('\nAll student passwords: password123\n');
    console.log('   Example login credentials:');
    console.log('   Email: aditi.sharma@stevens.edu');
    console.log('   Password: password123\n');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
};

// Run the seed script
runSeed();
