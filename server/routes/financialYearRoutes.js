const express = require('express');
const router = express.Router();
const FinancialYearModel = require('../models/FinancialYearModel');

// Get all financial years
router.get('/', async (req, res) => {
  try {
    const data = await FinancialYearModel.getAll();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching financial years:', error);
    res.status(500).json({ success: false, message: 'Error fetching financial years', error: error.message });
  }
});

// Get financial year by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const data = await FinancialYearModel.getById(id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Financial year not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching financial year:', error);
    res.status(500).json({ success: false, message: 'Error fetching financial year', error: error.message });
  }
});

// Get financial years by firm ID
router.get('/firm/:firmId', async (req, res) => {
  try {
    const firmId = parseInt(req.params.firmId);
    if (isNaN(firmId)) {
      return res.status(400).json({ success: false, message: 'Invalid Firm ID' });
    }
    const data = await FinancialYearModel.getByFirmId(firmId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching financial years by firm:', error);
    res.status(500).json({ success: false, message: 'Error fetching financial years', error: error.message });
  }
});

// Get current financial year for a firm
router.get('/current/:firmId', async (req, res) => {
  try {
    const firmId = parseInt(req.params.firmId);
    if (isNaN(firmId)) {
      return res.status(400).json({ success: false, message: 'Invalid Firm ID' });
    }
    const data = await FinancialYearModel.getCurrentByFirmId(firmId);
    if (!data) {
      return res.status(404).json({ success: false, message: 'No current financial year found for this firm' });
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching current financial year:', error);
    res.status(500).json({ success: false, message: 'Error fetching current financial year', error: error.message });
  }
});

// Create a new financial year
router.post('/', async (req, res) => {
  try {
    const { FirmID, YearCode, YearName, StartDate, EndDate, IsCurrent, IsActive, Remarks, CreatedBy } = req.body;
    
    // Validate required fields
    if (!FirmID || !YearCode || !YearName || !StartDate || !EndDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'FirmID, YearCode, YearName, StartDate, and EndDate are required' 
      });
    }

    // Validate dates
    if (new Date(StartDate) >= new Date(EndDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'StartDate must be before EndDate' 
      });
    }

    const data = await FinancialYearModel.create({
      FirmID,
      YearCode,
      YearName,
      StartDate,
      EndDate,
      IsCurrent: IsCurrent || 0,
      IsActive: IsActive !== undefined ? IsActive : 1,
      Remarks,
      CreatedBy
    });
    
    res.status(201).json({ success: true, data, message: 'Financial year created successfully' });
  } catch (error) {
    console.error('Error creating financial year:', error);
    res.status(500).json({ success: false, message: 'Error creating financial year', error: error.message });
  }
});

// Update a financial year
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const { FirmID, YearCode, YearName, StartDate, EndDate, IsCurrent, IsActive, Remarks } = req.body;
    
    // Validate required fields
    if (!FirmID || !YearCode || !YearName || !StartDate || !EndDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'FirmID, YearCode, YearName, StartDate, and EndDate are required' 
      });
    }

    // Validate dates
    if (new Date(StartDate) >= new Date(EndDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'StartDate must be before EndDate' 
      });
    }

    const existing = await FinancialYearModel.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Financial year not found' });
    }

    const data = await FinancialYearModel.update(id, {
      FirmID,
      YearCode,
      YearName,
      StartDate,
      EndDate,
      IsCurrent: IsCurrent || 0,
      IsActive: IsActive !== undefined ? IsActive : 1,
      Remarks
    });
    
    res.json({ success: true, data, message: 'Financial year updated successfully' });
  } catch (error) {
    console.error('Error updating financial year:', error);
    res.status(500).json({ success: false, message: 'Error updating financial year', error: error.message });
  }
});

// Delete a financial year
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const existing = await FinancialYearModel.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Financial year not found' });
    }

    // Prevent deletion of current financial year
    if (existing.IsCurrent === 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete the current financial year. Please set another year as current first.' 
      });
    }

    const result = await FinancialYearModel.delete(id);
    if (result) {
      res.json({ success: true, message: 'Financial year deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Financial year not found' });
    }
  } catch (error) {
    console.error('Error deleting financial year:', error);
    res.status(500).json({ success: false, message: 'Error deleting financial year', error: error.message });
  }
});

// Get firms for dropdown
router.get('/firms/dropdown', async (req, res) => {
  try {
    const data = await FinancialYearModel.getFirmsDropdown();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching firms:', error);
    res.status(500).json({ success: false, message: 'Error fetching firms', error: error.message });
  }
});

module.exports = router;
