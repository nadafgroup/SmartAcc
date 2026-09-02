const express = require('express');
const router = express.Router();
const PlaceModel = require('../models/PlaceModel');

router.get('/', async (req, res) => {
    try {
        const places = await PlaceModel.getAll();
        res.json({ success: true, data: places });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const place = await PlaceModel.getById(req.params.id);
        if (place) {
            res.json({ success: true, data: place });
        } else {
            res.status(404).json({ success: false, message: 'Place not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newPlace = await PlaceModel.create(req.body);
        res.status(201).json({ success: true, data: newPlace });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            res.status(400).json({ success: false, message: 'Place Code already exists' });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await PlaceModel.update(req.params.id, req.body);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ success: false, message: 'Place not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await PlaceModel.delete(req.params.id);
        res.json({ success: true, message: 'Place deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id/confirm', async (req, res) => {
    try {
        const confirmed = await PlaceModel.confirm(req.params.id);
        if (confirmed) {
            res.json({ success: true, data: confirmed, message: 'Place confirmed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Place not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
