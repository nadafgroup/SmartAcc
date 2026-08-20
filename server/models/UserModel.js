const { getPool, sql } = require('../config/database');

class UserModel {
    static async getUserByUsername(username) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('Username', sql.NVarChar, username)
                .query(`
                    SELECT UserID, Username, Password, FullName, Email, Role, IsActive
                    FROM Users 
                    WHERE Username = @Username AND IsActive = 1
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    static async getUserById(id) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('UserID', sql.Int, id)
                .query(`
                    SELECT UserID, Username, FullName, Email, Role, IsActive
                    FROM Users 
                    WHERE UserID = @UserID AND IsActive = 1
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }

    static async updateLastLogin(id) {
        try {
            const pool = getPool();
            await pool.request()
                .input('UserID', sql.Int, id)
                .query(`
                    UPDATE Users 
                    SET LastLoginDate = GETDATE() 
                    WHERE UserID = @UserID
                `);
            return true;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = UserModel;