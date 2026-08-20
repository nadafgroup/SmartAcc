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
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server 2008 R2 successfully!');
        console.log(`   Server: ${config.server}`);
        console.log(`   Database: ${config.database}`);
        return pool;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
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