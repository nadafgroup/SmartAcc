// Inspect the States table schema and sample rows
const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'hpserver',
    server: 'HP\\HP2008R2',
    database: 'AccSmartDB',
    options: { encrypt: false, enableArithAbort: true, trustServerCertificate: true }
};

(async () => {
    try {
        const pool = await sql.connect(config);

        const cols = await pool.request().query(`
            SELECT c.name AS column_name, t.name AS data_type, c.is_nullable
            FROM sys.columns c
            JOIN sys.types t ON c.user_type_id = t.user_type_id
            WHERE c.object_id = OBJECT_ID('States')
            ORDER BY c.column_id
        `);
        console.log('States columns:');
        console.table(cols.recordset);

        const rows = await pool.request().query('SELECT TOP 5 * FROM States');
        console.log('States sample rows:', rows.recordset.length);
        console.table(rows.recordset);

        // Reproduce the getAll query
        try {
            const all = await pool.request().query('SELECT * FROM States WHERE IsActive = 1 ORDER BY StateName');
            console.log('getAll query OK, rows:', all.recordset.length);
        } catch (e) {
            console.error('getAll query FAILED:', e.message);
        }

        await sql.close();
    } catch (e) {
        console.error('Connection error:', e.message);
        process.exit(1);
    }
})();
