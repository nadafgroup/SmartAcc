const { getPool, sql } = require('../config/database');

class PlaceModel {
    static async getAll() {
        try {
            const pool = getPool();
            const result = await pool.request().query(`
                SELECT p.*, 
                       t.TalukaName,
                       t.TalukaCode,
                       d.DistrictName,
                       d.DistrictCode,
                       d.StateID,
                       s.StateName
                FROM Places p
                LEFT JOIN Talukas t ON p.TalukaID = t.TalukaID
                LEFT JOIN Districts d ON t.DistrictID = d.DistrictID
                LEFT JOIN States s ON d.StateID = s.StateID
                WHERE p.IsActive = 1
                ORDER BY p.PlaceCode
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
                .input('PlaceID', sql.Int, id)
                .query(`
                    SELECT p.*, 
                           t.TalukaName, t.TalukaCode,
                           d.DistrictName, d.DistrictCode
                    FROM Places p
                    LEFT JOIN Talukas t ON p.TalukaID = t.TalukaID
                    LEFT JOIN Districts d ON p.DistrictID = d.DistrictID
                    WHERE p.PlaceID = @PlaceID AND p.IsActive = 1
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
                .input('PlaceCode', sql.NVarChar, data.PlaceCode)
                .input('PlaceName', sql.NVarChar, data.PlaceName)
                .input('TalukaID', sql.Int, data.TalukaID || null)
                .input('DistrictID', sql.Int, data.DistrictID || null)
                .input('Pincode', sql.NVarChar, data.Pincode || '')
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    INSERT INTO Places (
                        PlaceCode, PlaceName, TalukaID, DistrictID, Pincode, OpeningBalance, IsActive, Remarks
                    )
                    VALUES (
                        @PlaceCode, @PlaceName, @TalukaID, @DistrictID, @Pincode, @OpeningBalance, @IsActive, @Remarks
                    )
                    SELECT SCOPE_IDENTITY() as PlaceID
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
                .input('PlaceID', sql.Int, id)
                .input('PlaceCode', sql.NVarChar, data.PlaceCode)
                .input('PlaceName', sql.NVarChar, data.PlaceName)
                .input('TalukaID', sql.Int, data.TalukaID || null)
                .input('DistrictID', sql.Int, data.DistrictID || null)
                .input('Pincode', sql.NVarChar, data.Pincode || '')
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    UPDATE Places 
                    SET PlaceCode = @PlaceCode,
                        PlaceName = @PlaceName,
                        TalukaID = @TalukaID,
                        DistrictID = @DistrictID,
                        Pincode = @Pincode,
                        OpeningBalance = @OpeningBalance,
                        IsActive = @IsActive,
                        Remarks = @Remarks,
                        ModifiedDate = GETDATE()
                    WHERE PlaceID = @PlaceID
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
                .input('PlaceID', sql.Int, id)
                .query(`
                    DELETE FROM Places 
                    WHERE PlaceID = @PlaceID
                `);
            if (result.rowsAffected[0] === 0) {
                throw new Error('Record not found or already deleted');
            }
            return true;
        } catch (err) {
            throw err;
        }
    }

    static async confirm(id) {
        try {
            const pool = getPool();
            const columnCheck = await pool.request().query(`
                SELECT COUNT(*) as hasColumn FROM sys.columns 
                WHERE Name = 'IsConfirmed' AND Object_ID = Object_ID('Places')
            `);
            
            if (columnCheck.recordset[0].hasColumn > 0) {
                await pool.request()
                    .input('PlaceID', sql.Int, id)
                    .query(`
                        UPDATE Places 
                        SET IsConfirmed = 1, ModifiedDate = GETDATE() 
                        WHERE PlaceID = @PlaceID
                    `);
            } else {
                await pool.request()
                    .input('PlaceID', sql.Int, id)
                    .query(`
                        UPDATE Places 
                        SET ModifiedDate = GETDATE() 
                        WHERE PlaceID = @PlaceID
                    `);
            }
            
            const result = await pool.request()
                .input('PlaceID', sql.Int, id)
                .query(`
                    SELECT * FROM Places WHERE PlaceID = @PlaceID AND IsActive = 1
                `);
            return result.recordset[0];
        } catch (err) {
            if (err.message.includes('Invalid column name')) {
                const pool = getPool();
                await pool.request()
                    .input('PlaceID', sql.Int, id)
                    .query(`
                        UPDATE Places 
                        SET ModifiedDate = GETDATE() 
                        WHERE PlaceID = @PlaceID
                    `);
                const result = await pool.request()
                    .input('PlaceID', sql.Int, id)
                    .query(`
                        SELECT * FROM Places WHERE PlaceID = @PlaceID AND IsActive = 1
                    `);
                return result.recordset[0];
            }
            throw err;
        }
    }
}

module.exports = PlaceModel;
