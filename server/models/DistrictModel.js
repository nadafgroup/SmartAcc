const { getPool, sql } = require('../config/database');

class DistrictModel {
    static async getAll() {
        try {
            const pool = getPool();
            const result = await pool.request().query(`
                SELECT d.*,
                       (SELECT COUNT(*) FROM Talukas WHERE DistrictID = d.DistrictID AND IsActive = 1) as TalukaCount
                FROM Districts d
                WHERE d.IsActive = 1
                ORDER BY d.DistrictCode
            `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }

    static async getById(id) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('DistrictID', sql.Int, id)
                .query(`
                    SELECT * FROM Districts 
                    WHERE DistrictID = @DistrictID AND IsActive = 1
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    static async create(data) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('DistrictCode', sql.NVarChar, data.DistrictCode)
                .input('DistrictName', sql.NVarChar, data.DistrictName)
                .input('StateID', sql.Int, data.StateID || null)
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    INSERT INTO Districts (
                        DistrictCode, DistrictName, StateID, OpeningBalance, IsActive, Remarks
                    )
                    VALUES (
                        @DistrictCode, @DistrictName, @StateID, @OpeningBalance, @IsActive, @Remarks
                    )
                    SELECT SCOPE_IDENTITY() as DistrictID
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    static async update(id, data) {
        try {
            const pool = getPool();
            await pool.request()
                .input('DistrictID', sql.Int, id)
                .input('DistrictCode', sql.NVarChar, data.DistrictCode)
                .input('DistrictName', sql.NVarChar, data.DistrictName)
                .input('StateID', sql.Int, data.StateID || null)
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    UPDATE Districts 
                    SET DistrictCode = @DistrictCode,
                        DistrictName = @DistrictName,
                        StateID = @StateID,
                        OpeningBalance = @OpeningBalance,
                        IsActive = @IsActive,
                        Remarks = @Remarks,
                        ModifiedDate = GETDATE()
                    WHERE DistrictID = @DistrictID
                `);
            return this.getById(id);
        } catch (err) {
            throw err;
        }
    }

    static async delete(id) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('DistrictID', sql.Int, id)
                .query(`
                    DELETE FROM Districts 
                    WHERE DistrictID = @DistrictID
                `);
            if (result.rowsAffected[0] === 0) {
                throw new Error('Record not found or already deleted');
            }
            return true;
        } catch (err) {
            if (err.message && (err.message.includes('REFERENCE') || err.message.includes('foreign key'))) {
                throw new Error('Cannot delete this District because it has linked Taluka records. Please delete the child records first.');
            }
            throw err;
        }
    }

    static async confirm(id) {
        try {
            const pool = getPool();
            // First check if the column exists
            const columnCheck = await pool.request().query(`
                SELECT COUNT(*) as hasColumn FROM sys.columns 
                WHERE Name = 'IsConfirmed' AND Object_ID = Object_ID('Districts')
            `);
            
            if (columnCheck.recordset[0].hasColumn > 0) {
                await pool.request()
                    .input('DistrictID', sql.Int, id)
                    .query(`
                        UPDATE Districts 
                        SET IsConfirmed = 1, ModifiedDate = GETDATE() 
                        WHERE DistrictID = @DistrictID
                    `);
            } else {
                await pool.request()
                    .input('DistrictID', sql.Int, id)
                    .query(`
                        UPDATE Districts 
                        SET ModifiedDate = GETDATE() 
                        WHERE DistrictID = @DistrictID
                    `);
            }
            
            const result = await pool.request()
                .input('DistrictID', sql.Int, id)
                .query(`
                    SELECT * FROM Districts WHERE DistrictID = @DistrictID AND IsActive = 1
                `);
            return result.recordset[0];
        } catch (err) {
            if (err.message.includes('Invalid column name')) {
                const pool = getPool();
                await pool.request()
                    .input('DistrictID', sql.Int, id)
                    .query(`
                        UPDATE Districts 
                        SET ModifiedDate = GETDATE() 
                        WHERE DistrictID = @DistrictID
                    `);
                const result = await pool.request()
                    .input('DistrictID', sql.Int, id)
                    .query(`
                        SELECT * FROM Districts WHERE DistrictID = @DistrictID AND IsActive = 1
                    `);
                return result.recordset[0];
            }
            throw err;
        }
    }
}

module.exports = DistrictModel;
