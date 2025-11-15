/**
 * Validation Utilities
 * Centralized validation functions for input data
 */

import { ObjectId } from 'mongodb';

/**
 * Checks if a value is a valid ObjectId
 * @param {any} id - Value to check
 * @returns {boolean} True if valid ObjectId
 */
export const isValidObjectId = (id) => {
  if (!id) return false;
  return ObjectId.isValid(id) && String(new ObjectId(id)) === String(id);
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

/**
 * Validates Stevens email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid Stevens email
 */
export const isValidStevensEmail = (email) => {
  if (!isValidEmail(email)) return false;
  return email.toLowerCase().endsWith('@stevens.edu');
};

/**
 * Validates string input
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field (for error messages)
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 1000)
 * @returns {string} Trimmed string
 * @throws {Error} If validation fails
 */
export const validateString = (
  value,
  fieldName,
  minLength = 1,
  maxLength = 1000
) => {
  if (value === undefined || value === null) {
    throw new Error(`${fieldName} is required`);
  }
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} character(s)`);
  }
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
  }
  return trimmed;
};

/**
 * Validates number input
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Validated number
 * @throws {Error} If validation fails
 */
export const validateNumber = (
  value,
  fieldName,
  min = -Infinity,
  max = Infinity
) => {
  if (value === undefined || value === null) {
    throw new Error(`${fieldName} is required`);
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  if (num < min || num > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
  return num;
};

/**
 * Validates boolean input
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field
 * @returns {boolean} Validated boolean
 * @throws {Error} If validation fails
 */
export const validateBoolean = (value, fieldName) => {
  if (value === undefined || value === null) {
    throw new Error(`${fieldName} is required`);
  }
  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} must be a boolean`);
  }
  return value;
};

/**
 * Validates array input
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field
 * @returns {Array} Validated array
 * @throws {Error} If validation fails
 */
export const validateArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }
  return value;
};

/**
 * Sanitizes string for XSS prevention
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
