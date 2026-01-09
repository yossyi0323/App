import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

async function createDb() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    // Replace database name with 'postgres' to connect to default db
    // Assuming format postgres://user:pass@host:port/dbname
    const urlParts = new URL(dbUrl);
    const dbName = urlParts.pathname.slice(1); // remove leading /
    urlParts.pathname = '/postgres';
    const postgresUrl = urlParts.toString();

    console.log(`Connecting to ${postgresUrl} to create ${dbName}...`);

    const client = new Client({ connectionString: postgresUrl });

    try {
        await client.connect();

        // Check if exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
        if (res.rowCount === 0) {
            console.log(`Creating database ${dbName}...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log('Database created successfully.');
        } else {
            console.log('Database already exists.');
        }
    } catch (e) {
        console.error('Error creating database:', e);
    } finally {
        await client.end();
    }
}

createDb();
