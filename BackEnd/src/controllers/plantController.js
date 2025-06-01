// plantController.js
// Controller for plant-related API endpoints

const PlantModel = require('../models/plantModel');

module.exports = {
  /**
   * Get all plants
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllPlants: async (req, res) => {
    try {
      const plants = await PlantModel.getAllPlants();
      res.json({ plants });
    } catch (error) {
      console.error('Error in getAllPlants controller:', error);
      res.status(500).json({ error: 'Failed to retrieve plants' });
    }
  },

  /**
   * Get a plant by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPlantById: async (req, res) => {
    try {
      const { id } = req.params;
      const plant = await PlantModel.getPlantById(parseInt(id));
      
      if (!plant) {
        return res.status(404).json({ error: 'Plant not found' });
      }
      
      res.json({ plant });
    } catch (error) {
      console.error('Error in getPlantById controller:', error);
      res.status(500).json({ error: 'Failed to retrieve plant' });
    }
  },

  /**
   * Create a new plant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createPlant: async (req, res) => {
    try {
      const { name, species, careInstructions, waterFrequency } = req.body;
      
      // Validate required fields
      if (!name || !species) {
        return res.status(400).json({ error: 'Name and species are required' });
      }
      
      const result = await PlantModel.createPlant({
        name,
        species,
        careInstructions,
        waterFrequency
      });
      
      res.status(201).json({ 
        message: 'Plant created successfully',
        plantId: result.insertId 
      });
    } catch (error) {
      console.error('Error in createPlant controller:', error);
      res.status(500).json({ error: 'Failed to create plant' });
    }
  },

  /**
   * Update a plant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updatePlant: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, species, careInstructions, waterFrequency } = req.body;
      
      // Validate required fields
      if (!name || !species) {
        return res.status(400).json({ error: 'Name and species are required' });
      }
      
      const result = await PlantModel.updatePlant(parseInt(id), {
        name,
        species,
        careInstructions,
        waterFrequency
      });
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Plant not found' });
      }
      
      res.json({ message: 'Plant updated successfully' });
    } catch (error) {
      console.error('Error in updatePlant controller:', error);
      res.status(500).json({ error: 'Failed to update plant' });
    }
  },

  /**
   * Delete a plant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deletePlant: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await PlantModel.deletePlant(parseInt(id));
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Plant not found' });
      }
      
      res.json({ message: 'Plant deleted successfully' });
    } catch (error) {
      console.error('Error in deletePlant controller:', error);
      res.status(500).json({ error: 'Failed to delete plant' });
    }
  }
};