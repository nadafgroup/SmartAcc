const { getPool, sql } = require('../config/database');

class StateModel {
    static async getAll() {
        try {
            const pool = getPool();
            const result = await pool.request().query(`
                SELECT * FROM States 
                WHERE IsActive = 1
                ORDER BY StateName
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
                .input('StateID', sql.Int, id)
                .query(`
                    SELECT * FROM States 
                    WHERE StateID = @StateID AND IsActive = 1
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
                .input('StateCode', sql.NVarChar, data.StateCode)
                .input('StateName', sql.NVarChar, data.StateName)
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    INSERT INTO States (
                        StateCode, StateName, OpeningBalance, IsActive, Remarks
                    )
                    VALUES (
                        @StateCode, @StateName, @OpeningBalance, @IsActive, @Remarks
                    )
                    SELECT SCOPE_IDENTITY() as StateID
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
                .input('StateID', sql.Int, id)
                .input('StateCode', sql.NVarChar, data.StateCode)
                .input('StateName', sql.NVarChar, data.StateName)
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    UPDATE States 
                    SET StateCode = @StateCode,
                        StateName = @StateName,
                        OpeningBalance = @OpeningBalance,
                        IsActive = @IsActive,
                        Remarks = @Remarks,
                        ModifiedDate = GETDATE()
                    WHERE StateID = @StateID
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
                .input('StateID', sql.Int, id)
                .query(`
                    DELETE FROM States 
                    WHERE StateID = @StateID
                `);
            if (result.rowsAffected[0] === 0) {
                throw new Error('Record not found or already deleted');
            }
            return true;
        } catch (err) {
            if (err.message && (err.message.includes('REFERENCE') || err.message.includes('foreign key'))) {
                throw new Error('Cannot delete this State because it has linked District records. Please delete the child records first.');
            }
            throw err;
        }
    }

    static async confirm(id) {
        try {
            const pool = getPool();
            const columnCheck = await pool.request().query(`
                SELECT COUNT(*) as hasColumn FROM sys.columns 
                WHERE Name = 'IsConfirmed' AND Object_ID = Object_ID('States')
            `);
            
            if (columnCheck.recordset[0].hasColumn > 0) {
                await pool.request()
                    .input('StateID', sql.Int, id)
                    .query(`
                        UPDATE States 
                        SET IsConfirmed = 1, ModifiedDate = GETDATE() 
                        WHERE StateID = @StateID
                    `);
            } else {
                await pool.request()
                    .input('StateID', sql.Int, id)
                    .query(`
                        UPDATE States 
                        SET ModifiedDate = GETDATE() 
                        WHERE StateID = @StateID
                    `);
            }
            
            const result = await pool.request()
                .input('StateID', sql.Int, id)
                .query(`
                    SELECT * FROM States WHERE StateID = @StateID AND IsActive = 1
                `);
            return result.recordset[0];
        } catch (err) {
            if (err.message.includes('Invalid column name')) {
                const pool = getPool();
                await pool.request()
                    .input('StateID', sql.Int, id)
                    .query(`
                        UPDATE States 
                        SET ModifiedDate = GETDATE() 
                        WHERE StateID = @StateID
                    `);
                const result = await pool.request()
                    .input('StateID', sql.Int, id)
                    .query(`
                        SELECT * FROM States WHERE StateID = @StateID AND IsActive = 1
                    `);
                return result.recordset[0];
            }
            throw err;
        }
    }
}

module.exports = StateModel;
