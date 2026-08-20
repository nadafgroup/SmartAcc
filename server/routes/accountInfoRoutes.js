const express = require('express');
const router = express.Router();
const AccountInfoModel = require('../models/AccountInfoModel');

router.get('/', async (req, res) => {
    try {
        const accounts = await AccountInfoModel.getAll();
        res.json({ success: true, data: accounts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const account = await AccountInfoModel.getById(req.params.id);
        if (account) {
            res.json({ success: true, data: account });
        } else {
            res.status(404).json({ success: false, message: 'Account not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newAccount = await AccountInfoModel.create(req.body);
        res.status(201).json({ success: true, data: newAccount });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            res.status(400).json({ success: false, message: 'Account Code already exists' });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await AccountInfoModel.update(req.params.id, req.body);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ success: false, message: 'Account not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await AccountInfoModel.delete(req.params.id);
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;