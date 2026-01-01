import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema';
import { tasks, taskDependencies } from '../src/db/schema';
import { addDays, subDays } from 'date-fns';

const dbUrl = process.env.DATABASE_URL?.replace('localhost', '127.0.0.1');

const pool = new Pool({
    connectionString: dbUrl,
});

const db = drizzle(pool, { schema });

async function seed() {
    console.log('Seeding data...');

    // Clear existing
    await db.delete(taskDependencies);
    await db.delete(tasks);

    // 1. Root Goal: "Release SelfManagement v1.0"
    const [root] = await db.insert(tasks).values({
        title: 'Release SelfManagement v1.0',
        status: 'doing',
        objective: 'Create the ultimate personal ERP',
    }).returning();

    // 2. Epic: Planning
    const [planning] = await db.insert(tasks).values({
        title: 'Phase 1: Planning',
        parentId: root.id,
        status: 'done',
        startAt: subDays(new Date(), 5),
        endAt: subDays(new Date(), 2),
    }).returning();

    // 3. Epic: Development (Current)
    const [dev] = await db.insert(tasks).values({
        title: 'Phase 2: Development',
        parentId: root.id,
        status: 'doing',
        startAt: subDays(new Date(), 1),
        endAt: addDays(new Date(), 14),
    }).returning();

    // Tasks under Development
    const [dbSetup] = await db.insert(tasks).values({
        title: 'Database Setup (Postgres)',
        parentId: dev.id,
        status: 'done',
        startAt: subDays(new Date(), 1),
        endAt: new Date(),
    }).returning();

    const [gantt] = await db.insert(tasks).values({
        title: 'Implement Gantt Chart',
        parentId: dev.id,
        status: 'doing',
        startAt: new Date(),
        endAt: addDays(new Date(), 3),
    }).returning();

    const [deploy] = await db.insert(tasks).values({
        title: 'Deploy to AWS',
        parentId: dev.id,
        status: 'planned',
        startAt: addDays(new Date(), 5),
        endAt: addDays(new Date(), 7),
    }).returning();

    console.log('Seeding complete!');
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
