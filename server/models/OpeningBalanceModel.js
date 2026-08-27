const { getPool, sql } = require('../config/database');

class OpeningBalanceModel {
  static async query(sqlString, params = []) {
    try {
      const pool = getPool();
      const request = pool.request();
      params.forEach((param, index) => {
        request.input(`p${index}`, param);
      });
      // Replace ? with @p0, @p1, etc.
      let queryString = sqlString;
      let paramIndex = 0;
      queryString = queryString.replace(/\?/g, () => `@p${paramIndex++}`);
      const result = await request.query(queryString);
      return result.recordset;
    } catch (err) {
      console.error('Database query error:', err.message);
      throw err;
    }
  }

  static async execute(sqlString, params = []) {
    try {
      const pool = getPool();
      const request = pool.request();
      params.forEach((param, index) => {
        request.input(`p${index}`, param);
      });
      let queryString = sqlString;
      let paramIndex = 0;
      queryString = queryString.replace(/\?/g, () => `@p${paramIndex++}`);
      const result = await request.query(queryString);
      return result;
    } catch (err) {
      console.error('Database execute error:', err.message);
      throw err;
    }
  }

  static async getAll() {
    const sqlString = `
      SELECT 
        ob.OpeningBalanceID,
        ob.AccountID,
        ai.AccountCode,
        ai.AccountName,
        ai.GroupID,
        ag.GroupName,
        ob.OpeningBalance,
        ob.BalanceType,
        ob.FinancialYear,
        ob.IsPosted,
        ob.PostedDate,
        ob.CreatedDate,
        ob.ModifiedDate
      FROM opening_balance ob
      INNER JOIN AccountInfo ai ON ob.AccountID = ai.AccountID
      LEFT JOIN AccountGroups ag ON ai.GroupID = ag.GroupID
      ORDER BY ai.AccountCode
    `;
    return await this.query(sqlString);
  }

  static async getById(id) {
    const pool = getPool();
    let request = pool.request();
    request.input('id', id);
    const sqlString = `
      SELECT 
        ob.OpeningBalanceID,
        ob.AccountID,
        ai.AccountCode,
        ai.AccountName,
        ai.GroupID,
        ag.GroupName,
        ob.OpeningBalance,
        ob.BalanceType,
        ob.FinancialYear,
        ob.IsPosted,
        ob.PostedDate,
        ob.CreatedDate,
        ob.ModifiedDate
      FROM opening_balance ob
      INNER JOIN AccountInfo ai ON ob.AccountID = ai.AccountID
      LEFT JOIN AccountGroups ag ON ai.GroupID = ag.GroupID
      WHERE ob.OpeningBalanceID = @id
    `;
    const result = await request.query(sqlString);
    return result.recordset[0];
  }

  static async getByAccount(accountId) {
    const sqlString = `
      SELECT 
        ob.OpeningBalanceID,
        ob.AccountID,
        ai.AccountCode,
        ai.AccountName,
        ob.OpeningBalance,
        ob.BalanceType,
        ob.FinancialYear,
        ob.IsPosted,
        ob.PostedDate,
        ob.CreatedDate,
        ob.ModifiedDate
      FROM opening_balance ob
      INNER JOIN AccountInfo ai ON ob.AccountID = ai.AccountID
      WHERE ob.AccountID = ?
      ORDER BY ob.CreatedDate DESC
    `;
    return await this.query(sqlString, [accountId]);
  }

  static async create(data) {
    const { AccountID, OpeningBalance, BalanceType, FinancialYear } = data;
    const sqlString = `
      INSERT INTO opening_balance (
        AccountID, OpeningBalance, BalanceType, FinancialYear, IsPosted, CreatedDate
      ) VALUES (?, ?, ?, ?, 0, GETDATE());
      SELECT SCOPE_IDENTITY() as id;
    `;
    const result = await this.query(sqlString, [AccountID, OpeningBalance, BalanceType, FinancialYear]);
    const newId = result[0]?.id || result[0]?.ID || result[0]?.OpeningBalanceID;
    if (newId) {
      return this.getById(newId);
    }
    // Fallback: get the latest record for this account
    const fallbackResult = await this.query(`
      SELECT TOP 1 OpeningBalanceID FROM opening_balance 
      WHERE AccountID = ? 
      ORDER BY CreatedDate DESC
    `, [AccountID]);
    if (fallbackResult.length > 0) {
      return this.getById(fallbackResult[0].OpeningBalanceID);
    }
    return null;
  }

  static async update(id, data) {
    const { OpeningBalance, BalanceType, FinancialYear } = data;
    console.log('Updating opening balance:', { id, OpeningBalance, BalanceType, FinancialYear });
    
    // Check if already posted
    const checkSql = `SELECT IsPosted FROM opening_balance WHERE OpeningBalanceID = @id`;
    const pool = getPool();
    let checkRequest = pool.request();
    checkRequest.input('id', id);
    const checkResult = await checkRequest.query(checkSql);
    if (checkResult.recordset.length > 0 && checkResult.recordset[0].IsPosted) {
      throw new Error('Cannot update a posted opening balance record');
    }
    
    // Perform update using named parameters
    const sqlString = `
      UPDATE opening_balance 
      SET 
        OpeningBalance = @openingBalance,
        BalanceType = @balanceType,
        FinancialYear = @financialYear,
        ModifiedDate = GETDATE()
      WHERE OpeningBalanceID = @id
    `;
    let request = pool.request();
    request.input('openingBalance', OpeningBalance);
    request.input('balanceType', BalanceType);
    request.input('financialYear', FinancialYear);
    request.input('id', id);
    const result = await request.query(sqlString);
    console.log('Update result:', result);
    
    const updatedRecord = await this.getById(id);
    console.log('Updated record:', updatedRecord);
    return updatedRecord;
  }

  static async delete(id) {
    // Check if already posted
    const checkSql = `SELECT IsPosted FROM opening_balance WHERE OpeningBalanceID = ?`;
    const checkResult = await this.query(checkSql, [id]);
    if (checkResult.length > 0 && checkResult[0].IsPosted) {
      throw new Error('Cannot delete a posted opening balance record');
    }
    const sqlString = `DELETE FROM opening_balance WHERE OpeningBalanceID = ?`;
    await this.query(sqlString, [id]);
    return true;
  }

  static async post(id) {
    // Get the opening balance record first
    const record = await this.getById(id);
    if (!record) {
      throw new Error('Opening balance record not found');
    }
    if (record.IsPosted) {
      throw new Error('Record is already posted');
    }
    
    // Update opening_balance table
    const sqlString = `
      UPDATE opening_balance 
      SET 
        IsPosted = 1,
        PostedDate = GETDATE(),
        ModifiedDate = GETDATE()
      WHERE OpeningBalanceID = ?
    `;
    await this.query(sqlString, [id]);
    
    // Update AccountInfo with the opening balance
    const updateAccountSql = `
      UPDATE AccountInfo 
      SET 
        OpeningBalance = ?,
        BalanceType = ?,
        ModifiedDate = GETDATE()
      WHERE AccountID = ?
    `;
    await this.query(updateAccountSql, [
      record.OpeningBalance,
      record.BalanceType,
      record.AccountID
    ]);
    
    return this.getById(id);
  }

  static async getAvailableAccounts(financialYear) {
    const sqlString = `
      SELECT 
        ai.AccountID,
        ai.AccountCode,
        ai.AccountName,
        ai.GroupID,
        ag.GroupName,
        ai.OpeningBalance,
        ai.BalanceType
      FROM AccountInfo ai
      LEFT JOIN AccountGroups ag ON ai.GroupID = ag.GroupID
      WHERE ai.IsActive = 1
        AND ai.AccountID NOT IN (
          SELECT AccountID FROM opening_balance 
          WHERE FinancialYear = ? AND IsPosted = 1
        )
      ORDER BY ai.AccountCode
    `;
    return await this.query(sqlString, [financialYear]);
  }
}

module.exports = OpeningBalanceModel;
