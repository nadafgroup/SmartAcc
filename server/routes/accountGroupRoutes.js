const express = require('express');
const router = express.Router();
const AccountGroupModel = require('../models/AccountGroupModel');

router.get('/', async (req, res) => {
    try {
        const groups = await AccountGroupModel.getAll();
        res.json({ success: true, data: groups });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const group = await AccountGroupModel.getById(req.params.id);
        if (group) {
            res.json({ success: true, data: group });
        } else {
            res.status(404).json({ success: false, message: 'Group not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newGroup = await AccountGroupModel.create(req.body);
        res.status(201).json({ success: true, data: newGroup });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            res.status(400).json({ success: false, message: 'Group Code already exists' });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await AccountGroupModel.update(req.params.id, req.body);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ success: false, message: 'Group not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await AccountGroupModel.delete(req.params.id);
        res.json({ success: true, message: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id/confirm', async (req, res) => {
    try {
        const confirmed = await AccountGroupModel.confirm(req.params.id);
        if (confirmed) {
            res.json({ success: true, data: confirmed, message: 'Group confirmed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Group not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;