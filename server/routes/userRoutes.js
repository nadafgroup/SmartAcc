const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');

// GET all users
router.get('/', async (req, res) => {
    try {
        const users = await UserModel.getAll();
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await UserModel.getById(req.params.id);
        if (user) {
            res.json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create user
router.post('/', async (req, res) => {
    try {
        const newUser = await UserModel.create(req.body);
        res.status(201).json({ success: true, data: newUser });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            res.status(400).json({ success: false, message: 'User Code or Username already exists' });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

// PUT update user
router.put('/:id', async (req, res) => {
    try {
        const updated = await UserModel.update(req.params.id, req.body);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await UserModel.delete(req.params.id);
        if (deleted) {
            res.json({ success: true, message: 'User deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST confirm user
router.post('/:id/confirm', async (req, res) => {
    try {
        const confirmed = await UserModel.confirm(req.params.id);
        if (confirmed) {
            res.json({ success: true, message: 'User confirmed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST lock/unlock user
router.post('/:id/lock', async (req, res) => {
    try {
        const { isLocked } = req.body;
        const result = await UserModel.toggleLock(req.params.id, isLocked);
        if (result) {
            res.json({ success: true, message: `User ${isLocked ? 'locked' : 'unlocked'} successfully` });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;