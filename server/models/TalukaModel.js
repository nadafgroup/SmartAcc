const { getPool, sql } = require('../config/database');

class TalukaModel {
    static async getAll() {
        try {
            const pool = getPool();
            const result = await pool.request().query(`
                SELECT t.*, 
                       d.DistrictName,
                       d.DistrictCode,
                       d.StateID,
                       s.StateName,
                       (SELECT COUNT(*) FROM Places WHERE TalukaID = t.TalukaID AND IsActive = 1) as PlaceCount
                FROM Talukas t
                LEFT JOIN Districts d ON t.DistrictID = d.DistrictID
                LEFT JOIN States s ON d.StateID = s.StateID
                ORDER BY t.TalukaName
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
                .input('TalukaID', sql.Int, id)
                .query(`
                    SELECT t.*, d.DistrictName, d.DistrictCode
                    FROM Talukas t
                    LEFT JOIN Districts d ON t.DistrictID = d.DistrictID
                    WHERE t.TalukaID = @TalukaID AND t.IsActive = 1
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
                .input('TalukaCode', sql.NVarChar, data.TalukaCode)
                .input('TalukaName', sql.NVarChar, data.TalukaName)
                .input('DistrictID', sql.Int, data.DistrictID || null)
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    INSERT INTO Talukas (
                        TalukaCode, TalukaName, DistrictID, OpeningBalance, IsActive, Remarks
                    )
                    VALUES (
                        @TalukaCode, @TalukaName, @DistrictID, @OpeningBalance, @IsActive, @Remarks
                    )
                    SELECT SCOPE_IDENTITY() as TalukaID
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
                .input('TalukaID', sql.Int, id)
                .input('TalukaCode', sql.NVarChar, data.TalukaCode)
                .input('TalukaName', sql.NVarChar, data.TalukaName)
                .input('DistrictID', sql.Int, data.DistrictID || null)
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    UPDATE Talukas 
                    SET TalukaCode = @TalukaCode,
                        TalukaName = @TalukaName,
                        DistrictID = @DistrictID,
                        OpeningBalance = @OpeningBalance,
                        IsActive = @IsActive,
                        Remarks = @Remarks,
                        ModifiedDate = GETDATE()
                    WHERE TalukaID = @TalukaID
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
                .input('TalukaID', sql.Int, id)
                .query(`
                    DELETE FROM Talukas 
                    WHERE TalukaID = @TalukaID
                `);
            if (result.rowsAffected[0] === 0) {
                throw new Error('Record not found or already deleted');
            }
            return true;
        } catch (err) {
            if (err.message && (err.message.includes('REFERENCE') || err.message.includes('foreign key'))) {
                throw new Error('Cannot delete this Taluka because it has linked Place records. Please delete the child records first.');
            }
            throw err;
        }
    }

    static async confirm(id) {
        try {
            const pool = getPool();
            const columnCheck = await pool.request().query(`
                SELECT COUNT(*) as hasColumn FROM sys.columns 
                WHERE Name = 'IsConfirmed' AND Object_ID = Object_ID('Talukas')
            `);
            
            if (columnCheck.recordset[0].hasColumn > 0) {
                await pool.request()
                    .input('TalukaID', sql.Int, id)
                    .query(`
                        UPDATE Talukas 
                        SET IsConfirmed = 1, ModifiedDate = GETDATE() 
                        WHERE TalukaID = @TalukaID
                    `);
            } else {
                await pool.request()
                    .input('TalukaID', sql.Int, id)
                    .query(`
                        UPDATE Talukas 
                        SET ModifiedDate = GETDATE() 
                        WHERE TalukaID = @TalukaID
                    `);
            }
            
            const result = await pool.request()
                .input('TalukaID', sql.Int, id)
                .query(`
                    SELECT * FROM Talukas WHERE TalukaID = @TalukaID AND IsActive = 1
                `);
            return result.recordset[0];
        } catch (err) {
            if (err.message.includes('Invalid column name')) {
                const pool = getPool();
                await pool.request()
                    .input('TalukaID', sql.Int, id)
                    .query(`
                        UPDATE Talukas 
                        SET ModifiedDate = GETDATE() 
                        WHERE TalukaID = @TalukaID
                    `);
                const result = await pool.request()
                    .input('TalukaID', sql.Int, id)
                    .query(`
                        SELECT * FROM Talukas WHERE TalukaID = @TalukaID AND IsActive = 1
                    `);
                return result.recordset[0];
            }
            throw err;
        }
    }
}

module.exports = TalukaModel;
