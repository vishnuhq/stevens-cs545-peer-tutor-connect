/**
 * Database Configuration Module
 * Exports connection utilities and collection getters
 */

import { connectToDb, getDb, closeConnection } from './mongoConnection.js';

/**
 * Gets a collection from the database
 * @param {string} collectionName - Name of the collection
 * @returns {Collection} MongoDB collection
 */
const getCollection = (collectionName) => {
  const db = getDb();
  return db.collection(collectionName);
};

/**
 * Collection name constants
 */
const COLLECTIONS = {
  STUDENTS: 'students',
  COURSES: 'courses',
  QUESTIONS: 'questions',
  RESPONSES: 'responses',
  NOTIFICATIONS: 'notifications',
};

export { connectToDb, getDb, closeConnection, getCollection, COLLECTIONS };
