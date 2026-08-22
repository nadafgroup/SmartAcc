const sql = require('mssql');

// SQL Server 2008 R2 Configuration
// Your database files are in: F:\RashidWeb\MSSQLDATA
const config = {
    user: 'sa',
    password: 'hpserver',
    server: 'HP\\HP2008R2',  // Your SQL Server instance
    database: 'AccSmartDB',
    options: {
        encrypt: false,  // SQL Server 2008 R2 doesn't support encryption
        enableArithAbort: true,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Connection pool
let pool = null;

async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server 2008 R2 successfully!');
        console.log(`   Server: ${config.server}`);
        console.log(`   Database: ${config.database}`);
        console.log(`   Data Path: F:\\RashidWeb\\MSSQLDATA`);
        return pool;
    } catch (err) {
        console.error('❌ Database connection failed:');
        console.error(`   Error: ${err.message}`);
        if (err.message.includes('Login failed')) {
            console.error('   Please check username and password');
        }
        if (err.message.includes('Cannot find')) {
            console.error('   Please check server name and instance');
        }
        throw err;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Database not connected. Call connectDB first.');
    }
    return pool;
}

module.exports = { connectDB, getPool, sql };