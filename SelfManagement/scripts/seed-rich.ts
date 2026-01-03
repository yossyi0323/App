
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/db';
import { tasks, timeBlocks, taskToTimeBlocks, taskDependencies } from '../src/db/schema';
import { addDays, subDays, startOfWeek, setHours, setMinutes } from 'date-fns';

async function main() {
    console.log('Seeding rich sample data...');

    // 1. Clear existing data
    await db.delete(taskDependencies);
    await db.delete(taskToTimeBlocks);
    await db.delete(tasks);
    await db.delete(timeBlocks);

    const today = new Date();
    const startOfWk = startOfWeek(today, { weekStartsOn: 1 });

    // 2. High-Level Objectives
    const [projectAlpha] = await db.insert(tasks).values({
        title: 'Project Alpha Deployment',
        objective: 'Complete the production deployment of the new system.',
        outputDefinition: 'System live and accessible by all users.',
        status: 'doing',
        category: 'work',
    }).returning();

    const [personalGrowth] = await db.insert(tasks).values({
        title: 'Q1 Personal Growth',
        objective: 'Improve technical skills and health.',
        status: 'doing',
        category: 'life',
    }).returning();

    // 3. Sub-tasks for Project Alpha
    const [backend] = await db.insert(tasks).values({
        title: 'Phase 1: Backend API',
        parentId: projectAlpha.id,
        status: 'done',
        category: 'work',
        startAt: subDays(today, 5),
        endAt: subDays(today, 1),
    }).returning();

    const [frontend] = await db.insert(tasks).values({
        title: 'Phase 2: Frontend Dashboard',
        parentId: projectAlpha.id,
        status: 'doing',
        category: 'work',
        startAt: subDays(today, 1),
        endAt: addDays(today, 5),
    }).returning();

    const [auth] = await db.insert(tasks).values({
        title: 'Implement Auth Flow',
        parentId: frontend.id,
        status: 'doing',
        category: 'work',
    }).returning();

    const [charts] = await db.insert(tasks).values({
        title: 'Interactive Charts',
        parentId: frontend.id,
        status: 'planned',
        category: 'work',
    }).returning();

    // 4. Sub-tasks for Personal Growth
    const [book] = await db.insert(tasks).values({
        title: 'Read "Atomic Habits"',
        parentId: personalGrowth.id,
        status: 'doing',
        category: 'life',
    }).returning();

    const [exercise] = await db.insert(tasks).values({
        title: 'Daily 30min Run',
        parentId: personalGrowth.id,
        status: 'doing',
        category: 'life',
    }).returning();

    // 5. Time Blocks (Schedules)

    // Multi-task Block: Shinkansen Travel (Work)
    const [shinkansen] = await db.insert(timeBlocks).values({
        title: 'Shinkansen Travel (Tokyo -> Osaka)',
        startAt: setMinutes(setHours(today, 9), 0),
        endAt: setMinutes(setHours(today, 11), 30),
        type: 'plan',
        notes: 'Opportunity for deep work and reading.',
    }).returning();

    // Assign multiple tasks to Shinkansen block
    await db.insert(taskToTimeBlocks).values([
        { taskId: auth.id, timeBlockId: shinkansen.id },
        { taskId: book.id, timeBlockId: shinkansen.id }
    ]);

    // Afternoon Deep Work
    const [deepWork] = await db.insert(timeBlocks).values({
        title: 'Focus: Frontend UI',
        startAt: setMinutes(setHours(today, 14), 0),
        endAt: setMinutes(setHours(today, 17), 0),
        type: 'plan',
    }).returning();

    await db.insert(taskToTimeBlocks).values([
        { taskId: auth.id, timeBlockId: deepWork.id },
        { taskId: charts.id, timeBlockId: deepWork.id }
    ]);

    // Morning Routine (Health)
    const [morningRun] = await db.insert(timeBlocks).values({
        title: 'Morning Routine',
        startAt: setMinutes(setHours(today, 7), 0),
        endAt: setMinutes(setHours(today, 8), 0),
        type: 'actual',
        notes: 'Completed 5km!',
    }).returning();

    await db.insert(taskToTimeBlocks).values([
        { taskId: exercise.id, timeBlockId: morningRun.id }
    ]);

    console.log('Successfully seeded rich data with many-to-many relationships.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
