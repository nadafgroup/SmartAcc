// Apply add-users-columns.sql to the configured SQL Server database
const fs = require('fs');
const path = require('path');
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

async function applyMigration() {
    const pool = await sql.connect(config);
    console.log('Connected to', config.database);

    const sqlFile = path.join(__dirname, 'add-users-columns.sql');
    const content = fs.readFileSync(sqlFile, 'utf8');

    // Split on GO batch separators if present; otherwise run whole script
    const batches = content
        .split(/^\s*GO\s*$/gim)
        .map(b => b.trim())
        .filter(b => b.length > 0);

    for (const batch of batches) {
        await pool.request().batch(batch);
        console.log('Executed batch of', batch.split('\n').length, 'lines');
    }

    const cols = await pool.request().query(`
        SELECT c.name FROM sys.columns c
        WHERE c.object_id = OBJECT_ID('dbo.Users')
        ORDER BY c.column_id
    `);
    console.log('Users columns now:', cols.recordset.map(r => r.name).join(', '));

    await sql.close();
    console.log('Migration complete.');
}

applyMigration().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
