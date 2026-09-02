const express = require('express');
const router = express.Router();
const TalukaModel = require('../models/TalukaModel');

router.get('/', async (req, res) => {
    try {
        const talukas = await TalukaModel.getAll();
        res.json({ success: true, data: talukas });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const taluka = await TalukaModel.getById(req.params.id);
        if (taluka) {
            res.json({ success: true, data: taluka });
        } else {
            res.status(404).json({ success: false, message: 'Taluka not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newTaluka = await TalukaModel.create(req.body);
        res.status(201).json({ success: true, data: newTaluka });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            res.status(400).json({ success: false, message: 'Taluka Code already exists' });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await TalukaModel.update(req.params.id, req.body);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ success: false, message: 'Taluka not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await TalukaModel.delete(req.params.id);
        res.json({ success: true, message: 'Taluka deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id/confirm', async (req, res) => {
    try {
        const confirmed = await TalukaModel.confirm(req.params.id);
        if (confirmed) {
            res.json({ success: true, data: confirmed, message: 'Taluka confirmed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Taluka not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
