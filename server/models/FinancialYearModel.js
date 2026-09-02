const sql = require('mssql');
const { getPool } = require('../config/database');

class FinancialYearModel {
  // Get all financial years
  static async getAll() {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .query(`
          SELECT 
            fy.FinancialYearID,
            fy.FirmID,
            f.TradeName AS FirmName,
            fy.YearCode,
            fy.YearName,
            fy.StartDate,
            fy.EndDate,
            fy.IsCurrent,
            fy.IsActive,
            fy.Remarks,
            fy.CreatedBy,
            fy.CreatedDate,
            fy.ModifiedDate
          FROM FinancialYears fy
          INNER JOIN Firms f ON fy.FirmID = f.FirmID
          ORDER BY fy.YearCode DESC, fy.FirmID
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Get financial year by ID
  static async getById(id) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('FinancialYearID', sql.Int, id)
        .query(`
          SELECT 
            fy.FinancialYearID,
            fy.FirmID,
            f.TradeName AS FirmName,
            fy.YearCode,
            fy.YearName,
            fy.StartDate,
            fy.EndDate,
            fy.IsCurrent,
            fy.IsActive,
            fy.Remarks,
            fy.CreatedBy,
            fy.CreatedDate,
            fy.ModifiedDate
          FROM FinancialYears fy
          INNER JOIN Firms f ON fy.FirmID = f.FirmID
          WHERE fy.FinancialYearID = @FinancialYearID
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Get financial years by Firm ID
  static async getByFirmId(firmId) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('FirmID', sql.Int, firmId)
        .query(`
          SELECT 
            fy.FinancialYearID,
            fy.FirmID,
            f.TradeName AS FirmName,
            fy.YearCode,
            fy.YearName,
            fy.StartDate,
            fy.EndDate,
            fy.IsCurrent,
            fy.IsActive,
            fy.Remarks,
            fy.CreatedBy,
            fy.CreatedDate,
            fy.ModifiedDate
          FROM FinancialYears fy
          INNER JOIN Firms f ON fy.FirmID = f.FirmID
          WHERE fy.FirmID = @FirmID
          ORDER BY fy.YearCode DESC
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Get current financial year for a firm
  static async getCurrentByFirmId(firmId) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('FirmID', sql.Int, firmId)
        .query(`
          SELECT 
            fy.FinancialYearID,
            fy.FirmID,
            f.TradeName AS FirmName,
            fy.YearCode,
            fy.YearName,
            fy.StartDate,
            fy.EndDate,
            fy.IsCurrent,
            fy.IsActive,
            fy.Remarks,
            fy.CreatedBy,
            fy.CreatedDate,
            fy.ModifiedDate
          FROM FinancialYears fy
          INNER JOIN Firms f ON fy.FirmID = f.FirmID
          WHERE fy.FirmID = @FirmID AND fy.IsCurrent = 1 AND fy.IsActive = 1
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Create a new financial year
  static async create(data) {
    try {
      const pool = await getPool();
      
      // If IsCurrent is set to 1, set all other records for this firm to 0
      if (data.IsCurrent === 1) {
        await pool.request()
          .input('FirmID', sql.Int, data.FirmID)
          .query(`
            UPDATE FinancialYears 
            SET IsCurrent = 0 
            WHERE FirmID = @FirmID
          `);
      }

      const result = await pool.request()
        .input('FirmID', sql.Int, data.FirmID)
        .input('YearCode', sql.NVarChar(20), data.YearCode)
        .input('YearName', sql.NVarChar(100), data.YearName)
        .input('StartDate', sql.Date, data.StartDate)
        .input('EndDate', sql.Date, data.EndDate)
        .input('IsCurrent', sql.Bit, data.IsCurrent || 0)
        .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
        .input('Remarks', sql.NVarChar(500), data.Remarks || null)
        .input('CreatedBy', sql.NVarChar(50), data.CreatedBy || 'Admin')
        .query(`
          INSERT INTO FinancialYears (
            FirmID, YearCode, YearName, StartDate, EndDate,
            IsCurrent, IsActive, Remarks, CreatedBy, CreatedDate
          )
          VALUES (
            @FirmID, @YearCode, @YearName, @StartDate, @EndDate,
            @IsCurrent, @IsActive, @Remarks, @CreatedBy, GETDATE()
          )
          SELECT SCOPE_IDENTITY() AS FinancialYearID
        `);
      
      const newId = result.recordset[0].FinancialYearID;
      return await this.getById(newId);
    } catch (error) {
      throw error;
    }
  }

  // Update a financial year
  static async update(id, data) {
    try {
      const pool = await getPool();
      
      // If IsCurrent is set to 1, set all other records for this firm to 0
      if (data.IsCurrent === 1) {
        const existing = await this.getById(id);
        if (existing) {
          await pool.request()
            .input('FirmID', sql.Int, existing.FirmID)
            .query(`
              UPDATE FinancialYears 
              SET IsCurrent = 0 
              WHERE FirmID = @FirmID AND FinancialYearID != @FinancialYearID
            `);
        }
      }

      await pool.request()
        .input('FinancialYearID', sql.Int, id)
        .input('FirmID', sql.Int, data.FirmID)
        .input('YearCode', sql.NVarChar(20), data.YearCode)
        .input('YearName', sql.NVarChar(100), data.YearName)
        .input('StartDate', sql.Date, data.StartDate)
        .input('EndDate', sql.Date, data.EndDate)
        .input('IsCurrent', sql.Bit, data.IsCurrent || 0)
        .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
        .input('Remarks', sql.NVarChar(500), data.Remarks || null)
        .query(`
          UPDATE FinancialYears 
          SET 
            FirmID = @FirmID,
            YearCode = @YearCode,
            YearName = @YearName,
            StartDate = @StartDate,
            EndDate = @EndDate,
            IsCurrent = @IsCurrent,
            IsActive = @IsActive,
            Remarks = @Remarks,
            ModifiedDate = GETDATE()
          WHERE FinancialYearID = @FinancialYearID
        `);
      
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete a financial year
  static async delete(id) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('FinancialYearID', sql.Int, id)
        .query('DELETE FROM FinancialYears WHERE FinancialYearID = @FinancialYearID');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get firms for dropdown
  static async getFirmsDropdown() {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .query(`
          SELECT FirmID, TradeName 
          FROM Firms 
          WHERE IsActive = 1 
          ORDER BY TradeName
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = FinancialYearModel;
