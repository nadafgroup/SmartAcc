const { getPool, sql } = require('../config/database');

class UserModel {
    // Get user by username - For login
    static async getUserByUsername(username) {
        try {
            const pool = getPool();
            console.log('🔍 Looking for user:', username);
            const result = await pool.request()
                .input('Username', sql.NVarChar, username)
                .query(`
                    SELECT UserID, Username, Password, FullName, Email, Role, IsActive
                    FROM Users 
                    WHERE Username = @Username
                `);
            console.log('📊 Query result:', result.recordset);
            return result.recordset[0];
        } catch (err) {
            console.error('❌ getUserByUsername error:', err);
            throw err;
        }
    }

    // Get user by ID
    static async getUserById(id) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('UserID', sql.Int, id)
                .query(`
                    SELECT UserID, Username, FullName, Email, Role, IsActive
                    FROM Users 
                    WHERE UserID = @UserID
                `);
            return result.recordset[0];
        } catch (err) {
            console.error('❌ getUserById error:', err);
            throw err;
        }
    }

    // Update last login date
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
            console.error('❌ updateLastLogin error:', err);
            throw err;
        }
    }

    // Get all users
    static async getAll() {
        try {
            const pool = getPool();
            const result = await pool.request().query(`
                SELECT * FROM Users 
                WHERE IsActive = 1 
                ORDER BY UserCode
            `);
            return result.recordset;
        } catch (err) {
            console.error('❌ getAll error:', err);
            throw err;
        }
    }

    // Create new user
    static async create(data) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('UserCode', sql.NVarChar, data.UserCode)
                .input('Username', sql.NVarChar, data.Username)
                .input('Password', sql.NVarChar, data.Password)
                .input('FullName', sql.NVarChar, data.FullName)
                .input('Email', sql.NVarChar, data.Email || '')
                .input('Phone', sql.NVarChar, data.Phone || '')
                .input('Mobile', sql.NVarChar, data.Mobile || '')
                .input('Role', sql.NVarChar, data.Role || 'User')
                .input('Department', sql.NVarChar, data.Department || '')
                .input('Designation', sql.NVarChar, data.Designation || '')
                .input('Address', sql.NVarChar, data.Address || '')
                .input('City', sql.NVarChar, data.City || '')
                .input('State', sql.NVarChar, data.State || '')
                .input('Pincode', sql.NVarChar, data.Pincode || '')
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('IsLocked', sql.Bit, data.IsLocked !== undefined ? data.IsLocked : 0)
                .input('IsConfirmed', sql.Bit, data.IsConfirmed !== undefined ? data.IsConfirmed : 0)
                .input('CreatedBy', sql.NVarChar, data.CreatedBy || 'System')
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    INSERT INTO Users (
                        UserCode, Username, Password, FullName, Email, Phone, Mobile,
                        Role, Department, Designation, Address, City, State, Pincode,
                        IsActive, IsLocked, IsConfirmed, CreatedBy, Remarks
                    )
                    VALUES (
                        @UserCode, @Username, @Password, @FullName, @Email, @Phone, @Mobile,
                        @Role, @Department, @Designation, @Address, @City, @State, @Pincode,
                        @IsActive, @IsLocked, @IsConfirmed, @CreatedBy, @Remarks
                    )
                    SELECT SCOPE_IDENTITY() as UserID
                `);
            return result.recordset[0];
        } catch (err) {
            console.error('❌ create user error:', err);
            throw err;
        }
    }

    // Update user
    static async update(id, data) {
        try {
            const pool = getPool();
            await pool.request()
                .input('UserID', sql.Int, id)
                .input('UserCode', sql.NVarChar, data.UserCode)
                .input('Username', sql.NVarChar, data.Username)
                .input('Password', sql.NVarChar, data.Password)
                .input('FullName', sql.NVarChar, data.FullName)
                .input('Email', sql.NVarChar, data.Email || '')
                .input('Phone', sql.NVarChar, data.Phone || '')
                .input('Mobile', sql.NVarChar, data.Mobile || '')
                .input('Role', sql.NVarChar, data.Role || 'User')
                .input('Department', sql.NVarChar, data.Department || '')
                .input('Designation', sql.NVarChar, data.Designation || '')
                .input('Address', sql.NVarChar, data.Address || '')
                .input('City', sql.NVarChar, data.City || '')
                .input('State', sql.NVarChar, data.State || '')
                .input('Pincode', sql.NVarChar, data.Pincode || '')
                .input('IsActive', sql.Bit, data.IsActive !== undefined ? data.IsActive : 1)
                .input('IsLocked', sql.Bit, data.IsLocked !== undefined ? data.IsLocked : 0)
                .input('IsConfirmed', sql.Bit, data.IsConfirmed !== undefined ? data.IsConfirmed : 0)
                .input('Remarks', sql.NVarChar, data.Remarks || '')
                .query(`
                    UPDATE Users 
                    SET UserCode = @UserCode,
                        Username = @Username,
                        Password = @Password,
                        FullName = @FullName,
                        Email = @Email,
                        Phone = @Phone,
                        Mobile = @Mobile,
                        Role = @Role,
                        Department = @Department,
                        Designation = @Designation,
                        Address = @Address,
                        City = @City,
                        State = @State,
                        Pincode = @Pincode,
                        IsActive = @IsActive,
                        IsLocked = @IsLocked,
                        IsConfirmed = @IsConfirmed,
                        Remarks = @Remarks,
                        ModifiedDate = GETDATE()
                    WHERE UserID = @UserID
                `);
            return this.getUserById(id);
        } catch (err) {
            console.error('❌ update user error:', err);
            throw err;
        }
    }

    // Delete user (soft delete)
    static async delete(id) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('UserID', sql.Int, id)
                .query(`
                    UPDATE Users 
                    SET IsActive = 0, ModifiedDate = GETDATE() 
                    WHERE UserID = @UserID
                `);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('❌ delete user error:', err);
            throw err;
        }
    }

    // Confirm user
    static async confirm(id) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('UserID', sql.Int, id)
                .query(`
                    UPDATE Users 
                    SET IsConfirmed = 1, ModifiedDate = GETDATE() 
                    WHERE UserID = @UserID
                `);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('❌ confirm user error:', err);
            throw err;
        }
    }

    // Lock/Unlock user
    static async toggleLock(id, isLocked) {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('UserID', sql.Int, id)
                .input('IsLocked', sql.Bit, isLocked)
                .query(`
                    UPDATE Users 
                    SET IsLocked = @IsLocked, ModifiedDate = GETDATE() 
                    WHERE UserID = @UserID
                `);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('❌ toggleLock error:', err);
            throw err;
        }
    }
}

module.exports = UserModel;