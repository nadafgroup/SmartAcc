const express = require('express');
const router = express.Router();
const FirmModel = require('../models/FirmModel');

router.get('/', async (req, res) => {
    try {
        const firms = await FirmModel.getAll();
        res.json({ success: true, data: firms });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const firm = await FirmModel.getById(req.params.id);
        if (firm) {
            res.json({ success: true, data: firm });
        } else {
            res.status(404).json({ success: false, message: 'Firm not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newFirm = await FirmModel.create(req.body);
        res.status(201).json({ success: true, data: newFirm });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            res.status(400).json({ success: false, message: 'Firm Code already exists' });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await FirmModel.update(req.params.id, req.body);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ success: false, message: 'Firm not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await FirmModel.delete(req.params.id);
        res.json({ success: true, message: 'Firm deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;