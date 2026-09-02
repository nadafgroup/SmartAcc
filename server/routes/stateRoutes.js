const express = require('express');
const router = express.Router();
const StateModel = require('../models/StateModel');

router.get('/', async (req, res) => {
    try {
        const states = await StateModel.getAll();
        res.json({ success: true, data: states });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const state = await StateModel.getById(req.params.id);
        if (state) {
            res.json({ success: true, data: state });
        } else {
            res.status(404).json({ success: false, message: 'State not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newState = await StateModel.create(req.body);
        res.status(201).json({ success: true, data: newState });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            res.status(400).json({ success: false, message: 'State Code already exists' });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await StateModel.update(req.params.id, req.body);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ success: false, message: 'State not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await StateModel.delete(req.params.id);
        res.json({ success: true, message: 'State deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id/confirm', async (req, res) => {
    try {
        const confirmed = await StateModel.confirm(req.params.id);
        if (confirmed) {
            res.json({ success: true, data: confirmed, message: 'State confirmed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'State not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
