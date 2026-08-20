const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'hpserver',
    server: 'HP\\HP2008R2',
    database: 'AccSmartDB',
    options: {
        encrypt: false,
        enableArithAbort: true,
        trustServerCertificate: true
    }
};

async function setupUsers() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to database');

        // Check if Users table exists
        const tableCheck = await pool.request().query(`
            SELECT * FROM sys.tables WHERE name = 'Users'
        `);

        if (tableCheck.recordset.length === 0) {
            console.log('Creating Users table...');
            await pool.request().query(`
                CREATE TABLE Users (
                    UserID INT IDENTITY(1,1) PRIMARY KEY,
                    Username NVARCHAR(50) NOT NULL UNIQUE,
                    Password NVARCHAR(255) NOT NULL,
                    FullName NVARCHAR(100),
                    Email NVARCHAR(100),
                    Role NVARCHAR(50),
                    IsActive BIT DEFAULT 1,
                    LastLoginDate DATETIME,
                    CreatedDate DATETIME DEFAULT GETDATE()
                )
            `);
            console.log('Users table created');
        } else {
            console.log('Users table already exists');
        }

        // Insert default users
        console.log('Inserting default users...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin')
            BEGIN
                INSERT INTO Users (Username, Password, FullName, Email, Role)
                VALUES ('admin', 'admin123', 'Administrator', 'admin@accsmart.com', 'Admin')
            END
        `);

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'user')
            BEGIN
                INSERT INTO Users (Username, Password, FullName, Email, Role)
                VALUES ('user', 'user123', 'Test User', 'user@accsmart.com', 'User')
            END
        `);

        // Show all users
        const users = await pool.request().query(`
            SELECT UserID, Username, Password, FullName, Email, Role, IsActive
            FROM Users
        `);
        console.log('Users in database:');
        console.table(users.recordset);

        await sql.close();
        console.log('Setup complete!');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

setupUsers();
