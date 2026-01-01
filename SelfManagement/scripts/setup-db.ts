
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Parse the connection string to get host/port/user/pass, but override DB to 'postgres'
const dbUrl = process.env.DATABASE_URL!;
const url = new URL(dbUrl);
// Switch to 'postgres' database to perform administrative tasks
const adminUrl = `${url.protocol}//${url.username}:${url.password}@${url.hostname}:${url.port}/postgres`;

async function main() {
    console.log(`Connecting to ${adminUrl}...`);
    const client = new Client({ connectionString: adminUrl });

    try {
        await client.connect();
        console.log('Connected to admin DB successfully.');

        const dbName = 'self_management';
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

        if (res.rowCount === 0) {
            console.log(`Database ${dbName} does not exist. Creating...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database ${dbName} created.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
    } catch (err: any) {
        if (err.code === '28P01') {
            console.error('AUTHENTICATION FAILED: Check your .env.local password.');
        } else {
            console.error('Database setup failed:', err.message);
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
