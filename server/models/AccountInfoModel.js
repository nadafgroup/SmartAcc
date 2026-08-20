const { getPool, sql } = require('../config/database');

class AccountInfoModel {
    static async getAll() {
        try {
            const pool = getPool();
            const result = await pool.request().query(`
                SELECT a.*, g.GroupName, g.GroupCode, g.GroupType
                FROM AccountInfo a
                INNER JOIN AccountGroups g ON a.GroupID = g.GroupID
                WHERE a.IsActive = 1
                ORDER BY a.AccountCode
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
                .input('AccountID', sql.Int, id)
                .query(`
                    SELECT a.*, g.GroupName, g.GroupCode
                    FROM AccountInfo a
                    INNER JOIN AccountGroups g ON a.GroupID = g.GroupID
                    WHERE a.AccountID = @AccountID AND a.IsActive = 1
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
                .input('AccountCode', sql.NVarChar, data.AccountCode)
                .input('AccountName', sql.NVarChar, data.AccountName)
                .input('GroupID', sql.Int, data.GroupID)
                .input('Address', sql.NVarChar, data.Address || '')
                .input('City', sql.NVarChar, data.City || '')
                .input('State', sql.NVarChar, data.State || '')
                .input('Pincode', sql.NVarChar, data.Pincode || '')
                .input('Phone', sql.NVarChar, data.Phone || '')
                .input('Mobile', sql.NVarChar, data.Mobile || '')
                .input('Email', sql.NVarChar, data.Email || '')
                .input('GSTIN', sql.NVarChar, data.GSTIN || '')
                .input('PAN', sql.NVarChar, data.PAN || '')
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('BalanceType', sql.NVarChar, data.BalanceType || 'Dr')
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    INSERT INTO AccountInfo (
                        AccountCode, AccountName, GroupID, Address, City, State, 
                        Pincode, Phone, Mobile, Email, GSTIN, PAN, 
                        OpeningBalance, BalanceType, IsActive, Remarks
                    )
                    VALUES (
                        @AccountCode, @AccountName, @GroupID, @Address, @City, @State,
                        @Pincode, @Phone, @Mobile, @Email, @GSTIN, @PAN,
                        @OpeningBalance, @BalanceType, @IsActive, @Remarks
                    )
                    SELECT SCOPE_IDENTITY() as AccountID
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
                .input('AccountID', sql.Int, id)
                .input('AccountCode', sql.NVarChar, data.AccountCode)
                .input('AccountName', sql.NVarChar, data.AccountName)
                .input('GroupID', sql.Int, data.GroupID)
                .input('Address', sql.NVarChar, data.Address || '')
                .input('City', sql.NVarChar, data.City || '')
                .input('State', sql.NVarChar, data.State || '')
                .input('Pincode', sql.NVarChar, data.Pincode || '')
                .input('Phone', sql.NVarChar, data.Phone || '')
                .input('Mobile', sql.NVarChar, data.Mobile || '')
                .input('Email', sql.NVarChar, data.Email || '')
                .input('GSTIN', sql.NVarChar, data.GSTIN || '')
                .input('PAN', sql.NVarChar, data.PAN || '')
                .input('OpeningBalance', sql.Decimal, data.OpeningBalance || 0)
                .input('BalanceType', sql.NVarChar, data.BalanceType || 'Dr')
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    UPDATE AccountInfo 
                    SET AccountCode = @AccountCode,
                        AccountName = @AccountName,
                        GroupID = @GroupID,
                        Address = @Address,
                        City = @City,
                        State = @State,
                        Pincode = @Pincode,
                        Phone = @Phone,
                        Mobile = @Mobile,
                        Email = @Email,
                        GSTIN = @GSTIN,
                        PAN = @PAN,
                        OpeningBalance = @OpeningBalance,
                        BalanceType = @BalanceType,
                        IsActive = @IsActive,
                        Remarks = @Remarks,
                        ModifiedDate = GETDATE()
                    WHERE AccountID = @AccountID
                `);
            return this.getById(id);
        } catch (err) {
            throw err;
        }
    }

    static async delete(id) {
        try {
            const pool = getPool();
            await pool.request()
                .input('AccountID', sql.Int, id)
                .query(`
                    DELETE FROM AccountInfo 
                    WHERE AccountID = @AccountID
                `);
            return true;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = AccountInfoModel;