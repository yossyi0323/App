
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/db';
import { tasks, timeBlocks, taskToTimeBlocks } from '../src/db/schema';
import { addDays, startOfWeek, setHours, setMinutes } from 'date-fns';

async function main() {
    console.log('Seeding Phase 5 data...');

    // 1. Create a Task with Typed Custom Properties
    const [task] = await db.insert(tasks).values({
        title: 'Review PR #123',
        description: 'Review the new authentication flow.',
        status: 'doing',
        category: 'work',
        startAt: new Date(),
        endAt: addDays(new Date(), 2),
        customProperties: [
            { key: 'PR Link', value: 'https://gitlab.com/org/repo/-/merge_requests/123', type: 'url' },
            { key: 'Complexity', value: 'High', type: 'text' },
            { key: 'Blocker?', value: 'true', type: 'checkbox' },
            { key: 'Due Date', value: '2025-02-01', type: 'date' }
        ]
    }).returning();

    console.log('Created Task:', task.title);

    // 2. Create Time Blocks (Plan vs Actual)
    const today = new Date();
    const startOfWk = startOfWeek(today, { weekStartsOn: 1 });

    // Plan: Monday 10:00 - 12:00
    const [planBlock] = await db.insert(timeBlocks).values({
        type: 'plan',
        startAt: setMinutes(setHours(addDays(startOfWk, 0), 10), 0),
        endAt: setMinutes(setHours(addDays(startOfWk, 0), 12), 0),
        notes: 'Initial Review'
    }).returning();

    // Link task to plan block
    await db.insert(taskToTimeBlocks).values({
        taskId: task.id,
        timeBlockId: planBlock.id
    });

    // Actual: Monday 10:15 - 12:30 (Took longer)
    const [actualBlock] = await db.insert(timeBlocks).values({
        type: 'actual',
        startAt: setMinutes(setHours(addDays(startOfWk, 0), 10), 15),
        endAt: setMinutes(setHours(addDays(startOfWk, 0), 12), 30),
        notes: 'Found bug in login'
    }).returning();

    // Link task to actual block
    await db.insert(taskToTimeBlocks).values({
        taskId: task.id,
        timeBlockId: actualBlock.id
    });

    console.log('Seeding completed.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
