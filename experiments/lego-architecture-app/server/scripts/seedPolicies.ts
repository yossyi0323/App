import 'dotenv/config';
import { db } from '../src/db/index.js';
import { policies } from '../src/db/schema.js';

async function seed() {
    console.log('Seeding policies...');

    // Check if policies exist for ADMIN
    // Just insert to be sure (assuming empty usually, or ignore duplicate)
    // Using simple insert

    try {
        await db.insert(policies).values({
            id: crypto.randomUUID(),
            role: 'ADMIN',
            action: 'manage',
            subject: 'all',
        });
        console.log('Seeded ADMIN permissions: manage all');
    } catch (e) {
        console.error('Error seeding:', e);
    }

    process.exit(0);
}

seed().catch(console.error);
