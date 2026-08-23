const express = require('express');
const router = express.Router();
const ProductModel = require('../models/ProductModel');

// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await ProductModel.getAll();
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
});

// GET product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductModel.getById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Failed to fetch product', details: err.message });
    }
});

// CREATE new product
router.post('/', async (req, res) => {
    try {
        const { ProductCode, ProductName, Category, Price, StockQuantity, IsActive, Remarks } = req.body;
        
        // Validation
        if (!ProductCode || !ProductName || !Category) {
            return res.status(400).json({ error: 'ProductCode, ProductName, and Category are required' });
        }
        
        const product = await ProductModel.create({
            ProductCode,
            ProductName,
            Category,
            Price: Price || 0,
            StockQuantity: StockQuantity || 0,
            IsActive: IsActive !== undefined ? IsActive : true,
            Remarks: Remarks || null
        });
        
        res.status(201).json(product);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Failed to create product', details: err.message });
    }
});

// UPDATE product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ProductCode, ProductName, Category, Price, StockQuantity, IsActive, Remarks } = req.body;
        
        // Validation
        if (!ProductCode || !ProductName || !Category) {
            return res.status(400).json({ error: 'ProductCode, ProductName, and Category are required' });
        }
        
        const product = await ProductModel.update(id, {
            ProductCode,
            ProductName,
            Category,
            Price: Price || 0,
            StockQuantity: StockQuantity || 0,
            IsActive: IsActive !== undefined ? IsActive : true,
            Remarks: Remarks || null
        });
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Failed to update product', details: err.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await ProductModel.delete(id);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Failed to delete product', details: err.message });
    }
});

module.exports = router;
