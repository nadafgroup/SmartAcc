const { getPool, sql } = require('../config/database');

class FirmModel {
    static async getAll() {
        try {
            const pool = getPool();
            const result = await pool.request().query(`
                SELECT * FROM Firms 
                WHERE IsActive = 1 
                ORDER BY Code
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
                .input('FirmID', sql.Int, id)
                .query(`
                    SELECT * FROM Firms 
                    WHERE FirmID = @FirmID AND IsActive = 1
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
                .input('Code', sql.NVarChar, data.Code)
                .input('TradeName', sql.NVarChar, data.TradeName)
                .input('LegalName', sql.NVarChar, data.LegalName || '')
                .input('Alias', sql.NVarChar, data.Alias || '')
                .input('PanNo', sql.NVarChar, data.PanNo || '')
                .input('CINNo', sql.NVarChar, data.CINNo || '')
                .input('MSMEId', sql.NVarChar, data.MSMEId || '')
                .input('Jurisdiction', sql.NVarChar, data.Jurisdiction || '')
                .input('LandlineNo', sql.NVarChar, data.LandlineNo || '')
                .input('MobileNo', sql.NVarChar, data.MobileNo || '')
                .input('EmailId', sql.NVarChar, data.EmailId || '')
                .input('WebAddress', sql.NVarChar, data.WebAddress || '')
                .input('Address1', sql.NVarChar, data.Address1 || '')
                .input('Address2', sql.NVarChar, data.Address2 || '')
                .input('Place', sql.NVarChar, data.Place || '')
                .input('State', sql.NVarChar, data.State || '')
                .input('Pincode', sql.NVarChar, data.Pincode || '')
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('CreatedBy', sql.NVarChar, data.CreatedBy || 'System')
                .query(`
                    INSERT INTO Firms (
                        Code, TradeName, LegalName, Alias, PanNo, CINNo, MSMEId,
                        Jurisdiction, LandlineNo, MobileNo, EmailId, WebAddress,
                        Address1, Address2, Place, State, Pincode,
                        IsActive, CreatedBy
                    )
                    VALUES (
                        @Code, @TradeName, @LegalName, @Alias, @PanNo, @CINNo, @MSMEId,
                        @Jurisdiction, @LandlineNo, @MobileNo, @EmailId, @WebAddress,
                        @Address1, @Address2, @Place, @State, @Pincode,
                        @IsActive, @CreatedBy
                    )
                    SELECT SCOPE_IDENTITY() as FirmID
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
                .input('FirmID', sql.Int, id)
                .input('Code', sql.NVarChar, data.Code)
                .input('TradeName', sql.NVarChar, data.TradeName)
                .input('LegalName', sql.NVarChar, data.LegalName || '')
                .input('Alias', sql.NVarChar, data.Alias || '')
                .input('PanNo', sql.NVarChar, data.PanNo || '')
                .input('CINNo', sql.NVarChar, data.CINNo || '')
                .input('MSMEId', sql.NVarChar, data.MSMEId || '')
                .input('Jurisdiction', sql.NVarChar, data.Jurisdiction || '')
                .input('LandlineNo', sql.NVarChar, data.LandlineNo || '')
                .input('MobileNo', sql.NVarChar, data.MobileNo || '')
                .input('EmailId', sql.NVarChar, data.EmailId || '')
                .input('WebAddress', sql.NVarChar, data.WebAddress || '')
                .input('Address1', sql.NVarChar, data.Address1 || '')
                .input('Address2', sql.NVarChar, data.Address2 || '')
                .input('Place', sql.NVarChar, data.Place || '')
                .input('State', sql.NVarChar, data.State || '')
                .input('Pincode', sql.NVarChar, data.Pincode || '')
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .query(`
                    UPDATE Firms 
                    SET Code = @Code,
                        TradeName = @TradeName,
                        LegalName = @LegalName,
                        Alias = @Alias,
                        PanNo = @PanNo,
                        CINNo = @CINNo,
                        MSMEId = @MSMEId,
                        Jurisdiction = @Jurisdiction,
                        LandlineNo = @LandlineNo,
                        MobileNo = @MobileNo,
                        EmailId = @EmailId,
                        WebAddress = @WebAddress,
                        Address1 = @Address1,
                        Address2 = @Address2,
                        Place = @Place,
                        State = @State,
                        Pincode = @Pincode,
                        IsActive = @IsActive,
                        ModifiedDate = GETDATE()
                    WHERE FirmID = @FirmID
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
                .input('FirmID', sql.Int, id)
                .query(`
                    DELETE FROM Firms 
                    WHERE FirmID = @FirmID
                `);
            return true;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = FirmModel;