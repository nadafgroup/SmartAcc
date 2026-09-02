const express = require('express');
const router = express.Router();
const PrimaryGroupModel = require('../models/PrimaryGroupModel');

// Get all primary groups
router.get('/', async (req, res) => {
    try {
        const groups = await PrimaryGroupModel.getAll();
        res.json({ success: true, data: groups });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get primary group by ID
router.get('/:id', async (req, res) => {
    try {
        const group = await PrimaryGroupModel.getById(req.params.id);
        if (group) {
            res.json({ success: true, data: group });
        } else {
            res.status(404).json({ success: false, message: 'Primary Group not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create a new primary group
router.post('/', async (req, res) => {
    try {
        const newGroup = await PrimaryGroupModel.create(req.body);
        res.status(201).json({ success: true, data: newGroup });
    } catch (err) {
        if (err.message.includes('already exists')) {
            res.status(400).json({ success: false, message: err.message });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

// Update a primary group
router.put('/:id', async (req, res) => {
    try {
        const updated = await PrimaryGroupModel.update(req.params.id, req.body);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ success: false, message: 'Primary Group not found' });
        }
    } catch (err) {
        if (err.message.includes('already exists')) {
            res.status(400).json({ success: false, message: err.message });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

// Delete a primary group
router.delete('/:id', async (req, res) => {
    try {
        await PrimaryGroupModel.delete(req.params.id);
        res.json({ success: true, message: 'Primary Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Confirm a primary group
router.put('/:id/confirm', async (req, res) => {
    try {
        const confirmed = await PrimaryGroupModel.confirm(req.params.id);
        if (confirmed) {
            res.json({ success: true, data: confirmed, message: 'Primary Group confirmed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Primary Group not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get account groups for dropdown
router.get('/account-groups/dropdown', async (req, res) => {
    try {
        const groups = await PrimaryGroupModel.getAccountGroups();
        res.json({ success: true, data: groups });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get account info for dropdown
router.get('/account-info/dropdown', async (req, res) => {
    try {
        const accounts = await PrimaryGroupModel.getAccountInfo();
        res.json({ success: true, data: accounts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
