import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const client = new Client({
    connectionString: 'postgresql://postgres:password@127.0.0.1:65000/app_db',
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to Electric Proxy');

        const sql = fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf8');

        // Split commands by semicolon to run them one by one, 
        // though the proxy might handle the block. 
        // Let's try running the whole block first.
        console.log('Executing schema...');
        await client.query(sql);

        console.log('Migration complete');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
