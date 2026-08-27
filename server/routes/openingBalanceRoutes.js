const express = require('express');
const router = express.Router();
const OpeningBalanceModel = require('../models/OpeningBalanceModel');

// Get all opening balance records
router.get('/', async (req, res) => {
    try {
        const records = await OpeningBalanceModel.getAll();
        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get opening balance by ID
router.get('/:id', async (req, res) => {
    try {
        const record = await OpeningBalanceModel.getById(req.params.id);
        if (record) {
            res.json({ success: true, data: record });
        } else {
            res.status(404).json({ success: false, message: 'Record not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get opening balance by account ID
router.get('/account/:accountId', async (req, res) => {
    try {
        const records = await OpeningBalanceModel.getByAccount(req.params.accountId);
        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get available accounts for opening balance
router.get('/available/:financialYear', async (req, res) => {
    try {
        const accounts = await OpeningBalanceModel.getAvailableAccounts(req.params.financialYear);
        res.json({ success: true, data: accounts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create new opening balance record
router.post('/', async (req, res) => {
    try {
        const newRecord = await OpeningBalanceModel.create(req.body);
        res.status(201).json({ success: true, data: newRecord });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            res.status(400).json({ success: false, message: 'Opening balance already exists for this account and financial year' });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

// Update opening balance record
router.put('/:id', async (req, res) => {
    try {
        const updated = await OpeningBalanceModel.update(req.params.id, req.body);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ success: false, message: 'Record not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete opening balance record
router.delete('/:id', async (req, res) => {
    try {
        await OpeningBalanceModel.delete(req.params.id);
        res.json({ success: true, message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Post opening balance record
router.post('/:id/post', async (req, res) => {
    try {
        const posted = await OpeningBalanceModel.post(req.params.id);
        res.json({ success: true, data: posted, message: 'Opening balance posted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
