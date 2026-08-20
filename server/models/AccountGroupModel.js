const { getPool, sql } = require('../config/database');

class AccountGroupModel {
    static async getAll() {
        try {
            const pool = getPool();
            const result = await pool.request().query(`
                SELECT g.*, 
                       p.GroupName as ParentGroupName,
                       (SELECT COUNT(*) FROM AccountInfo WHERE GroupID = g.GroupID) as AccountCount
                FROM AccountGroups g
                LEFT JOIN AccountGroups p ON g.ParentGroupID = p.GroupID
                WHERE g.IsActive = 1
                ORDER BY g.GroupCode
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
                .input('GroupID', sql.Int, id)
                .query(`
                    SELECT * FROM AccountGroups 
                    WHERE GroupID = @GroupID AND IsActive = 1
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
                .input('GroupCode', sql.NVarChar, data.GroupCode)
                .input('GroupName', sql.NVarChar, data.GroupName)
                .input('ParentGroupID', sql.Int, data.ParentGroupID || null)
                .input('GroupType', sql.NVarChar, data.GroupType)
                .input('NatureOfAccount', sql.NVarChar, data.NatureOfAccount)
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    INSERT INTO AccountGroups (
                        GroupCode, GroupName, ParentGroupID, GroupType, 
                        NatureOfAccount, OpeningBalance, IsActive, Remarks
                    )
                    VALUES (
                        @GroupCode, @GroupName, @ParentGroupID, @GroupType,
                        @NatureOfAccount, @OpeningBalance, @IsActive, @Remarks
                    )
                    SELECT SCOPE_IDENTITY() as GroupID
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
                .input('GroupID', sql.Int, id)
                .input('GroupCode', sql.NVarChar, data.GroupCode)
                .input('GroupName', sql.NVarChar, data.GroupName)
                .input('ParentGroupID', sql.Int, data.ParentGroupID || null)
                .input('GroupType', sql.NVarChar, data.GroupType)
                .input('NatureOfAccount', sql.NVarChar, data.NatureOfAccount)
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    UPDATE AccountGroups 
                    SET GroupCode = @GroupCode,
                        GroupName = @GroupName,
                        ParentGroupID = @ParentGroupID,
                        GroupType = @GroupType,
                        NatureOfAccount = @NatureOfAccount,
                        OpeningBalance = @OpeningBalance,
                        IsActive = @IsActive,
                        Remarks = @Remarks,
                        ModifiedDate = GETDATE()
                    WHERE GroupID = @GroupID
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
                .input('GroupID', sql.Int, id)
                .query(`
                    DELETE FROM AccountGroups 
                    WHERE GroupID = @GroupID
                `);
            if (result.rowsAffected[0] === 0) {
                throw new Error('Record not found or already deleted');
            }
            return true;
        } catch (err) {
            // Check for foreign key constraint error
            if (err.message && (err.message.includes('REFERENCE') || err.message.includes('foreign key'))) {
                throw new Error('Cannot delete this Account Group because it has linked Account Info records. Please delete the child records first.');
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
                WHERE Name = 'IsConfirmed' AND Object_ID = Object_ID('AccountGroups')
            `);
            
            if (columnCheck.recordset[0].hasColumn > 0) {
                // Column exists, update it
                await pool.request()
                    .input('GroupID', sql.Int, id)
                    .query(`
                        UPDATE AccountGroups 
                        SET IsConfirmed = 1, ConfirmedDate = GETDATE(), ModifiedDate = GETDATE() 
                        WHERE GroupID = @GroupID
                    `);
            } else {
                // Column doesn't exist, just do a simple update
                await pool.request()
                    .input('GroupID', sql.Int, id)
                    .query(`
                        UPDATE AccountGroups 
                        SET ModifiedDate = GETDATE() 
                        WHERE GroupID = @GroupID
                    `);
            }
            
            // Fetch the updated record
            const result = await pool.request()
                .input('GroupID', sql.Int, id)
                .query(`
                    SELECT * FROM AccountGroups WHERE GroupID = @GroupID AND IsActive = 1
                `);
            return result.recordset[0];
        } catch (err) {
            // If column doesn't exist, try without it
            if (err.message.includes('Invalid column name')) {
                const pool = getPool();
                await pool.request()
                    .input('GroupID', sql.Int, id)
                    .query(`
                        UPDATE AccountGroups 
                        SET ModifiedDate = GETDATE() 
                        WHERE GroupID = @GroupID
                    `);
                const result = await pool.request()
                    .input('GroupID', sql.Int, id)
                    .query(`
                        SELECT * FROM AccountGroups WHERE GroupID = @GroupID AND IsActive = 1
                    `);
                return result.recordset[0];
            }
            throw err;
        }
    }
}

module.exports = AccountGroupModel;