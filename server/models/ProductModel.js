const sql = require('mssql');
const { getPool } = require('../config/database');

class ProductModel {
    // Get all products
    static async getAll() {
        const pool = await getPool();
        const result = await pool.request()
            .query(`
                SELECT 
                    ProductID,
                    ProductCode,
                    ProductName,
                    Category,
                    Price,
                    StockQuantity,
                    IsActive,
                    Remarks,
                    CreatedAt,
                    UpdatedAt
                FROM Products
                ORDER BY ProductCode
            `);
        return result.recordset;
    }

    // Get product by ID
    static async getById(id) {
        const pool = await getPool();
        const result = await pool.request()
            .input('ProductID', sql.Int, id)
            .query(`
                SELECT 
                    ProductID,
                    ProductCode,
                    ProductName,
                    Category,
                    Price,
                    StockQuantity,
                    IsActive,
                    Remarks,
                    CreatedAt,
                    UpdatedAt
                FROM Products
                WHERE ProductID = @ProductID
            `);
        return result.recordset[0];
    }

    // Create new product
    static async create(data) {
        const pool = await getPool();
        const result = await pool.request()
            .input('ProductCode', sql.NVarChar(50), data.ProductCode)
            .input('ProductName', sql.NVarChar(200), data.ProductName)
            .input('Category', sql.NVarChar(50), data.Category)
            .input('Price', sql.Decimal(18, 2), data.Price || 0)
            .input('StockQuantity', sql.Int, data.StockQuantity || 0)
            .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
            .input('Remarks', sql.NVarChar(500), data.Remarks || null)
            .query(`
                INSERT INTO Products (
                    ProductCode,
                    ProductName,
                    Category,
                    Price,
                    StockQuantity,
                    IsActive,
                    Remarks,
                    CreatedAt,
                    UpdatedAt
                )
                OUTPUT INSERTED.*
                VALUES (
                    @ProductCode,
                    @ProductName,
                    @Category,
                    @Price,
                    @StockQuantity,
                    @IsActive,
                    @Remarks,
                    GETDATE(),
                    GETDATE()
                )
            `);
        return result.recordset[0];
    }

    // Update product
    static async update(id, data) {
        const pool = await getPool();
        const result = await pool.request()
            .input('ProductID', sql.Int, id)
            .input('ProductCode', sql.NVarChar(50), data.ProductCode)
            .input('ProductName', sql.NVarChar(200), data.ProductName)
            .input('Category', sql.NVarChar(50), data.Category)
            .input('Price', sql.Decimal(18, 2), data.Price)
            .input('StockQuantity', sql.Int, data.StockQuantity)
            .input('IsActive', sql.Bit, data.IsActive)
            .input('Remarks', sql.NVarChar(500), data.Remarks || null)
            .query(`
                UPDATE Products
                SET 
                    ProductCode = @ProductCode,
                    ProductName = @ProductName,
                    Category = @Category,
                    Price = @Price,
                    StockQuantity = @StockQuantity,
                    IsActive = @IsActive,
                    Remarks = @Remarks,
                    UpdatedAt = GETDATE()
                OUTPUT INSERTED.*
                WHERE ProductID = @ProductID
            `);
        return result.recordset[0];
    }

    // Update product status (confirm)
    static async updateStatus(id, isActive) {
        const pool = await getPool();
        const result = await pool.request()
            .input('ProductID', sql.Int, id)
            .input('IsActive', sql.Bit, isActive)
            .query(`
                UPDATE Products
                SET 
                    IsActive = @IsActive,
                    UpdatedAt = GETDATE()
                OUTPUT INSERTED.*
                WHERE ProductID = @ProductID
            `);
        return result.recordset[0];
    }

    // Delete product
    static async delete(id) {
        const pool = await getPool();
        await pool.request()
            .input('ProductID', sql.Int, id)
            .query(`
                DELETE FROM Products
                WHERE ProductID = @ProductID
            `);
        return { success: true };
    }
}

module.exports = ProductModel;
