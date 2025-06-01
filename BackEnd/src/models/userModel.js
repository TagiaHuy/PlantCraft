// userModel.js
// Model for user-related database operations

const db = require('../services/db');
const bcrypt = require('bcrypt');

/**
 * User model with database operations
 */
const UserModel = {
  /**
   * Create a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Result with insertId
   */
  createUser: async (userData) => {
    try {
      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      const query = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';
      const params = [userData.name, userData.email, passwordHash];
      return await db.query(query, params);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User object
   */
  findByEmail: async (email) => {
    try {
      const query = 'SELECT * FROM users WHERE email = ?';
      const results = await db.query(query, [email]);
      return results[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result
   */
  updateProfile: async (userId, updateData) => {
    try {
      const query = 'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?';
      const params = [updateData.name, updateData.avatarUrl, userId];
      return await db.query(query, params);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Update user password
   * @param {number} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Update result
   */
  updatePassword: async (userId, newPassword) => {
    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      const query = 'UPDATE users SET password_hash = ? WHERE id = ?';
      return await db.query(query, [passwordHash, userId]);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  /**
   * Verify user email
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  verifyEmail: async (userId) => {
    try {
      const query = 'UPDATE users SET is_email_verified = TRUE WHERE id = ?';
      return await db.query(query, [userId]);
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   */
  getUserById: async (userId) => {
    try {
      const query = 'SELECT id, name, email, avatar_url, is_email_verified, created_at FROM users WHERE id = ?';
      const results = await db.query(query, [userId]);
      return results[0];
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  /**
   * Find pending registration by email
   * @param {string} email - User email
   * @returns {Promise<Object>} Pending registration object
   */
  findPendingByEmail: async (email) => {
    try {
      const query = 'SELECT * FROM pending_registrations WHERE email = ?';
      const results = await db.query(query, [email]);
      return results[0];
    } catch (error) {
      console.error('Error finding pending registration:', error);
      throw error;
    }
  },

  /**
   * Create pending registration
   * @param {Object} registrationData - Registration data
   * @returns {Promise<Object>} Result with insertId
   */
  createPendingRegistration: async (registrationData) => {
    try {
      const query = 'INSERT INTO pending_registrations (name, email, password_hash, verification_token, expires_at) VALUES (?, ?, ?, ?, ?)';
      const params = [
        registrationData.name,
        registrationData.email,
        registrationData.passwordHash,
        registrationData.verificationToken,
        registrationData.expiresAt
      ];
      return await db.query(query, params);
    } catch (error) {
      console.error('Error creating pending registration:', error);
      throw error;
    }
  },

  /**
   * Delete pending registration
   * @param {string} email - User email
   * @returns {Promise<Object>} Delete result
   */
  deletePendingRegistration: async (email) => {
    try {
      const query = 'DELETE FROM pending_registrations WHERE email = ?';
      return await db.query(query, [email]);
    } catch (error) {
      console.error('Error deleting pending registration:', error);
      throw error;
    }
  }
};

module.exports = UserModel;