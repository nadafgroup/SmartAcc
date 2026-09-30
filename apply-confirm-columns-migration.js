// Apply add-confirm-columns-toolbar-tables.sql to the configured SQL Server database
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

    const sqlFile = path.join(__dirname, 'add-confirm-columns-toolbar-tables.sql');
    let content = fs.readFileSync(sqlFile, 'utf8');

    // Remove comment-only lines so they don't get glued to statements
    content = content
        .split(/\r?\n/)
        .filter(line => !/^\s*--/.test(line))
        .join('\n');

    // Split into individual statements on GO or semicolons so that each
    // ALTER TABLE ADD runs before any UPDATE referencing the new column.
    const statements = content
        .split(/^\s*GO\s*$|;/gim)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const stmt of statements) {
        await pool.request().batch(stmt);
        console.log('OK:', stmt.split('\n')[0].slice(0, 80));
    }

    for (const table of ['Branches', 'FinancialYears', 'Products']) {
        const cols = await pool.request().query(`
            SELECT c.name FROM sys.columns c
            WHERE c.object_id = OBJECT_ID('dbo.${table}')
              AND c.name IN ('IsConfirmed', 'ConfirmedDate')
            ORDER BY c.name
        `);
        console.log(`${table} confirm columns:`, cols.recordset.map(r => r.name).join(', ') || '(none)');
    }

    await sql.close();
    console.log('Migration complete.');
}

applyMigration().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
