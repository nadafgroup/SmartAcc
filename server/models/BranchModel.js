const { getPool, sql } = require('../config/database');

class BranchModel {
    static async getAll() {
        try {
            const pool = getPool();
            const result = await pool.request().query(`
                SELECT b.*, f.TradeName as FirmName
                FROM Branches b
                LEFT JOIN Firms f ON b.FirmID = f.FirmID
                WHERE b.IsActive = 1
                ORDER BY b.Code
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
                .input('BranchID', sql.Int, id)
                .query(`
                    SELECT b.*, f.TradeName as FirmName
                    FROM Branches b
                    LEFT JOIN Firms f ON b.FirmID = f.FirmID
                    WHERE b.BranchID = @BranchID AND b.IsActive = 1
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    static async getByFirmId(firmId) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('FirmID', sql.Int, firmId)
                .query(`
                    SELECT * FROM Branches
                    WHERE FirmID = @FirmID AND IsActive = 1
                    ORDER BY Code
                `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }

    static async create(data) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('FirmID', sql.Int, data.FirmID)
                .input('Code', sql.NVarChar, data.Code)
                .input('Name', sql.NVarChar, data.Name)
                .input('Address1', sql.NVarChar, data.Address1 || '')
                .input('Address2', sql.NVarChar, data.Address2 || '')
                .input('Place', sql.NVarChar, data.Place || '')
                .input('State', sql.NVarChar, data.State || '')
                .input('Pincode', sql.NVarChar, data.Pincode || '')
                .input('Phone', sql.NVarChar, data.Phone || '')
                .input('Mobile', sql.NVarChar, data.Mobile || '')
                .input('Email', sql.NVarChar, data.Email || '')
                .input('ContactPerson', sql.NVarChar, data.ContactPerson || '')
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('CreatedBy', sql.NVarChar, data.CreatedBy || 'System')
                .query(`
                    INSERT INTO Branches (
                        FirmID, Code, Name, Address1, Address2, Place, State, Pincode,
                        Phone, Mobile, Email, ContactPerson, IsActive, CreatedBy
                    )
                    VALUES (
                        @FirmID, @Code, @Name, @Address1, @Address2, @Place, @State, @Pincode,
                        @Phone, @Mobile, @Email, @ContactPerson, @IsActive, @CreatedBy
                    )
                    SELECT SCOPE_IDENTITY() as BranchID
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
                .input('BranchID', sql.Int, id)
                .input('FirmID', sql.Int, data.FirmID)
                .input('Code', sql.NVarChar, data.Code)
                .input('Name', sql.NVarChar, data.Name)
                .input('Address1', sql.NVarChar, data.Address1 || '')
                .input('Address2', sql.NVarChar, data.Address2 || '')
                .input('Place', sql.NVarChar, data.Place || '')
                .input('State', sql.NVarChar, data.State || '')
                .input('Pincode', sql.NVarChar, data.Pincode || '')
                .input('Phone', sql.NVarChar, data.Phone || '')
                .input('Mobile', sql.NVarChar, data.Mobile || '')
                .input('Email', sql.NVarChar, data.Email || '')
                .input('ContactPerson', sql.NVarChar, data.ContactPerson || '')
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .query(`
                    UPDATE Branches
                    SET FirmID = @FirmID,
                        Code = @Code,
                        Name = @Name,
                        Address1 = @Address1,
                        Address2 = @Address2,
                        Place = @Place,
                        State = @State,
                        Pincode = @Pincode,
                        Phone = @Phone,
                        Mobile = @Mobile,
                        Email = @Email,
                        ContactPerson = @ContactPerson,
                        IsActive = @IsActive,
                        ModifiedDate = GETDATE()
                    WHERE BranchID = @BranchID
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
                .input('BranchID', sql.Int, id)
                .query(`
                    DELETE FROM Branches
                    WHERE BranchID = @BranchID
                `);
            return true;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = BranchModel;
