const express = require('express');
const router = express.Router();
const DistrictModel = require('../models/DistrictModel');

router.get('/', async (req, res) => {
    try {
        const districts = await DistrictModel.getAll();
        res.json({ success: true, data: districts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const district = await DistrictModel.getById(req.params.id);
        if (district) {
            res.json({ success: true, data: district });
        } else {
            res.status(404).json({ success: false, message: 'District not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newDistrict = await DistrictModel.create(req.body);
        res.status(201).json({ success: true, data: newDistrict });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            res.status(400).json({ success: false, message: 'District Code already exists' });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await DistrictModel.update(req.params.id, req.body);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ success: false, message: 'District not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await DistrictModel.delete(req.params.id);
        res.json({ success: true, message: 'District deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id/confirm', async (req, res) => {
    try {
        const confirmed = await DistrictModel.confirm(req.params.id);
        if (confirmed) {
            res.json({ success: true, data: confirmed, message: 'District confirmed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'District not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
