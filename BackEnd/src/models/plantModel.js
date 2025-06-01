// plantModel.js
// Model for plant-related database operations

const db = require('../services/db');

/**
 * Plant model with database operations
 */
const PlantModel = {
  /**
   * Get all plants from the database
   * @returns {Promise<Array>} Array of plant objects
   */
  getAllPlants: async () => {
    try {
      const query = 'SELECT * FROM plants';
      return await db.query(query);
    } catch (error) {
      console.error('Error getting plants:', error);
      throw error;
    }
  },

  /**
   * Get a plant by ID
   * @param {number} id - Plant ID
   * @returns {Promise<Object>} Plant object
   */
  getPlantById: async (id) => {
    try {
      const query = 'SELECT * FROM plants WHERE id = ?';
      const results = await db.query(query, [id]);
      return results[0]; // Return the first result or undefined
    } catch (error) {
      console.error(`Error getting plant with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new plant
   * @param {Object} plantData - Plant data object
   * @returns {Promise<Object>} Result with insertId
   */
  createPlant: async (plantData) => {
    try {
      const query = 'INSERT INTO plants (name, species, care_instructions, water_frequency) VALUES (?, ?, ?, ?)';
      const params = [plantData.name, plantData.species, plantData.careInstructions, plantData.waterFrequency];
      return await db.query(query, params);
    } catch (error) {
      console.error('Error creating plant:', error);
      throw error;
    }
  },

  /**
   * Update a plant
   * @param {number} id - Plant ID
   * @param {Object} plantData - Updated plant data
   * @returns {Promise<Object>} Result object
   */
  updatePlant: async (id, plantData) => {
    try {
      const query = 'UPDATE plants SET name = ?, species = ?, care_instructions = ?, water_frequency = ? WHERE id = ?';
      const params = [plantData.name, plantData.species, plantData.careInstructions, plantData.waterFrequency, id];
      return await db.query(query, params);
    } catch (error) {
      console.error(`Error updating plant with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a plant
   * @param {number} id - Plant ID
   * @returns {Promise<Object>} Result object
   */
  deletePlant: async (id) => {
    try {
      const query = 'DELETE FROM plants WHERE id = ?';
      return await db.query(query, [id]);
    } catch (error) {
      console.error(`Error deleting plant with id ${id}:`, error);
      throw error;
    }
  }
};

module.exports = PlantModel;