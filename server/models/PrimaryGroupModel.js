const { getPool, sql } = require('../config/database');
const { connectDB } = require('../config/database');

class PrimaryGroupModel {
    static async getAll() {
        try {
            // Ensure database is connected
            const pool = await connectDB();
            const result = await pool.request().query(`
                SELECT 
                    pg.PrimaryGroupID,
                    pg.PrimaryGroupCode,
                    pg.PrimaryGroupName,
                    pg.GroupType,
                    pg.NatureOfAccount,
                    pg.OpeningBalance,
                    pg.IsConfirmed,
                    pg.ConfirmedDate,
                    pg.IsActive,
                    pg.Remarks,
                    pg.CreatedBy,
                    pg.CreatedDate,
                    pg.ModifiedDate
                FROM PrimaryGroups pg
                WHERE pg.IsActive = 1
                ORDER BY pg.PrimaryGroupCode
            `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }

    static async getById(id) {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('PrimaryGroupID', sql.Int, id)
                .query(`
                    SELECT 
                        pg.PrimaryGroupID,
                        pg.PrimaryGroupCode,
                        pg.PrimaryGroupName,
                        pg.GroupType,
                        pg.NatureOfAccount,
                        pg.OpeningBalance,
                        pg.IsConfirmed,
                        pg.ConfirmedDate,
                        pg.IsActive,
                        pg.Remarks,
                        pg.CreatedBy,
                        pg.CreatedDate,
                        pg.ModifiedDate
                    FROM PrimaryGroups pg
                    WHERE pg.PrimaryGroupID = @PrimaryGroupID AND pg.IsActive = 1
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    static async create(data) {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('PrimaryGroupCode', sql.NVarChar, data.PrimaryGroupCode)
                .input('PrimaryGroupName', sql.NVarChar, data.PrimaryGroupName)
                .input('GroupType', sql.NVarChar, data.GroupType || null)
                .input('NatureOfAccount', sql.NVarChar, data.NatureOfAccount || null)
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .input('CreatedBy', sql.NVarChar, data.CreatedBy || 'Admin')
                .query(`
                    INSERT INTO PrimaryGroups (
                        PrimaryGroupCode, PrimaryGroupName,
                        GroupType, NatureOfAccount, OpeningBalance, IsActive, Remarks, CreatedBy, CreatedDate
                    )
                    VALUES (
                        @PrimaryGroupCode, @PrimaryGroupName,
                        @GroupType, @NatureOfAccount, @OpeningBalance, @IsActive, @Remarks, @CreatedBy, GETDATE()
                    )
                    SELECT SCOPE_IDENTITY() as PrimaryGroupID
                `);
            const newId = result.recordset[0].PrimaryGroupID;
            return await this.getById(newId);
        } catch (err) {
            if (err.message && err.message.includes('UNIQUE')) {
                throw new Error('Primary Group Code already exists');
            }
            throw err;
        }
    }

    static async update(id, data) {
        try {
            const pool = await connectDB();
            await pool.request()
                .input('PrimaryGroupID', sql.Int, id)
                .input('PrimaryGroupCode', sql.NVarChar, data.PrimaryGroupCode)
                .input('PrimaryGroupName', sql.NVarChar, data.PrimaryGroupName)
                .input('GroupType', sql.NVarChar, data.GroupType || null)
                .input('NatureOfAccount', sql.NVarChar, data.NatureOfAccount || null)
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    UPDATE PrimaryGroups 
                    SET 
                        PrimaryGroupCode = @PrimaryGroupCode,
                        PrimaryGroupName = @PrimaryGroupName,
                        GroupType = @GroupType,
                        NatureOfAccount = @NatureOfAccount,
                        OpeningBalance = @OpeningBalance,
                        IsActive = @IsActive,
                        Remarks = @Remarks,
                        ModifiedDate = GETDATE()
                    WHERE PrimaryGroupID = @PrimaryGroupID
                `);
            return await this.getById(id);
        } catch (err) {
            if (err.message && err.message.includes('UNIQUE')) {
                throw new Error('Primary Group Code already exists');
            }
            throw err;
        }
    }

    static async delete(id) {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('PrimaryGroupID', sql.Int, id)
                .query(`
                    DELETE FROM PrimaryGroups 
                    WHERE PrimaryGroupID = @PrimaryGroupID
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
            const pool = await connectDB();
            await pool.request()
                .input('PrimaryGroupID', sql.Int, id)
                .query(`
                    UPDATE PrimaryGroups 
                    SET 
                        IsConfirmed = 1, 
                        ConfirmedDate = GETDATE(), 
                        ModifiedDate = GETDATE() 
                    WHERE PrimaryGroupID = @PrimaryGroupID
                `);
            return await this.getById(id);
        } catch (err) {
            throw err;
        }
    }

    static async getAccountGroups() {
        try {
            const pool = await connectDB();
            const result = await pool.request().query(`
                SELECT GroupID, GroupName 
                FROM AccountGroups 
                WHERE IsActive = 1 
                ORDER BY GroupName
            `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }

    static async getAccountInfo() {
        try {
            const pool = await connectDB();
            const result = await pool.request().query(`
                SELECT AccountID, AccountName 
                FROM AccountInfo 
                WHERE IsActive = 1 
                ORDER BY AccountName
            `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = PrimaryGroupModel;
