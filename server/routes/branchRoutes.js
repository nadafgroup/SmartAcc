const express = require('express');
const router = express.Router();
const BranchModel = require('../models/BranchModel');
const FirmModel = require('../models/FirmModel');

// Get all branches
router.get('/', async (req, res) => {
    try {
        const branches = await BranchModel.getAll();
        res.json({ success: true, data: branches });
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch branches', error: error.message });
    }
});

// Get branch by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const branch = await BranchModel.getById(id);
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.json({ success: true, data: branch });
    } catch (error) {
        console.error('Error fetching branch:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch branch', error: error.message });
    }
});

// Get branches by firm ID
router.get('/firm/:firmId', async (req, res) => {
    try {
        const firmId = parseInt(req.params.firmId);
        const branches = await BranchModel.getByFirmId(firmId);
        res.json({ success: true, data: branches });
    } catch (error) {
        console.error('Error fetching branches by firm:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch branches', error: error.message });
    }
});

// Get firms for dropdown
router.get('/firms/dropdown', async (req, res) => {
    try {
        const firms = await FirmModel.getAll();
        res.json({ success: true, data: firms });
    } catch (error) {
        console.error('Error fetching firms for dropdown:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch firms', error: error.message });
    }
});

// Create a new branch
router.post('/', async (req, res) => {
    try {
        const branchData = req.body;
        const result = await BranchModel.create(branchData);
        const newBranch = await BranchModel.getById(result.BranchID);
        res.status(201).json({ success: true, data: newBranch, message: 'Branch created successfully' });
    } catch (error) {
        console.error('Error creating branch:', error);
        res.status(500).json({ success: false, message: 'Failed to create branch', error: error.message });
    }
});

// Update a branch
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const branchData = req.body;
        const updatedBranch = await BranchModel.update(id, branchData);
        if (!updatedBranch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.json({ success: true, data: updatedBranch, message: 'Branch updated successfully' });
    } catch (error) {
        console.error('Error updating branch:', error);
        res.status(500).json({ success: false, message: 'Failed to update branch', error: error.message });
    }
});

// Delete a branch
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await BranchModel.delete(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.json({ success: true, message: 'Branch deleted successfully' });
    } catch (error) {
        console.error('Error deleting branch:', error);
        res.status(500).json({ success: false, message: 'Failed to delete branch', error: error.message });
    }
});

module.exports = router;
