
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/db';
import { tasks, timeBlocks, taskToTimeBlocks, taskDependencies, comments } from '../src/db/schema';
import { addDays, subDays, startOfWeek, setHours, setMinutes, addWeeks } from 'date-fns';

async function main() {
    console.log('Seeding comprehensive sample data (30+ tasks)...');

    // 1. Clear existing data
    await db.delete(comments);
    await db.delete(taskDependencies);
    await db.delete(taskToTimeBlocks);
    await db.delete(tasks);
    await db.delete(timeBlocks);

    const today = new Date();
    const startOfWk = startOfWeek(today, { weekStartsOn: 1 });

    // ===== ROOT PROJECTS =====

    // Project 1: Product Launch
    const [productLaunch] = await db.insert(tasks).values({
        title: 'Q1 Product Launch',
        objective: 'Launch new SaaS platform to market',
        outputDefinition: 'Platform live, 1000+ beta users onboarded',
        status: 'doing',
        category: 'work',
        startAt: subDays(today, 30),
        endAt: addDays(today, 30),
    }).returning();

    // Phase 1: Planning (DONE)
    const [planning] = await db.insert(tasks).values({
        title: 'Phase 1: Planning & Research',
        parentId: productLaunch.id,
        status: 'done',
        category: 'work',
        startAt: subDays(today, 30),
        endAt: subDays(today, 20),
    }).returning();

    const [marketResearch] = await db.insert(tasks).values({
        title: 'Market Research',
        parentId: planning.id,
        status: 'done',
        category: 'work',
        startAt: subDays(today, 30),
        endAt: subDays(today, 27),
    }).returning();

    const [competitorAnalysis] = await db.insert(tasks).values({
        title: 'Competitor Analysis',
        parentId: planning.id,
        status: 'done',
        category: 'work',
        startAt: subDays(today, 27),
        endAt: subDays(today, 24),
    }).returning();

    const [requirements] = await db.insert(tasks).values({
        title: 'Requirements Definition',
        parentId: planning.id,
        status: 'done',
        category: 'work',
        startAt: subDays(today, 24),
        endAt: subDays(today, 20),
    }).returning();

    // Phase 2: Development (DOING)
    const [development] = await db.insert(tasks).values({
        title: 'Phase 2: Development',
        parentId: productLaunch.id,
        status: 'doing',
        category: 'work',
        startAt: subDays(today, 20),
        endAt: addDays(today, 10),
    }).returning();

    // Backend Development
    const [backend] = await db.insert(tasks).values({
        title: 'Backend API Development',
        parentId: development.id,
        status: 'doing',
        category: 'work',
        startAt: subDays(today, 20),
        endAt: addDays(today, 5),
        customProperties: [
            { key: 'Tech Stack', value: 'Node.js, PostgreSQL', type: 'text' },
            { key: 'Repository', value: 'https://github.com/company/backend', type: 'url' },
        ]
    }).returning();

    const [authModule] = await db.insert(tasks).values({
        title: 'Authentication Module',
        parentId: backend.id,
        status: 'done',
        category: 'work',
        startAt: subDays(today, 20),
        endAt: subDays(today, 15),
    }).returning();

    const [dataLayer] = await db.insert(tasks).values({
        title: 'Data Access Layer',
        parentId: backend.id,
        status: 'doing',
        category: 'work',
        startAt: subDays(today, 15),
        endAt: addDays(today, 2),
    }).returning();

    const [apiEndpoints] = await db.insert(tasks).values({
        title: 'REST API Endpoints',
        parentId: backend.id,
        status: 'waiting',
        category: 'work',
        startAt: addDays(today, 2),
        endAt: addDays(today, 5),
    }).returning();

    // Frontend Development
    const [frontend] = await db.insert(tasks).values({
        title: 'Frontend Dashboard',
        parentId: development.id,
        status: 'doing',
        category: 'work',
        startAt: subDays(today, 10),
        endAt: addDays(today, 10),
        customProperties: [
            { key: 'Tech Stack', value: 'React, TypeScript, Tailwind', type: 'text' },
        ]
    }).returning();

    const [uiComponents] = await db.insert(tasks).values({
        title: 'UI Component Library',
        parentId: frontend.id,
        status: 'done',
        category: 'work',
        startAt: subDays(today, 10),
        endAt: subDays(today, 5),
    }).returning();

    const [dashboardViews] = await db.insert(tasks).values({
        title: 'Dashboard Views',
        parentId: frontend.id,
        status: 'doing',
        category: 'work',
        startAt: subDays(today, 5),
        endAt: addDays(today, 3),
    }).returning();

    const [userSettings] = await db.insert(tasks).values({
        title: 'User Settings Page',
        parentId: frontend.id,
        status: 'planned',
        category: 'work',
        startAt: addDays(today, 3),
        endAt: addDays(today, 7),
    }).returning();

    const [integration] = await db.insert(tasks).values({
        title: 'Backend Integration',
        parentId: frontend.id,
        status: 'planned',
        category: 'work',
        startAt: addDays(today, 7),
        endAt: addDays(today, 10),
    }).returning();

    // Phase 3: Testing (PLANNED)
    const [testing] = await db.insert(tasks).values({
        title: 'Phase 3: Testing & QA',
        parentId: productLaunch.id,
        status: 'planned',
        category: 'work',
        startAt: addDays(today, 10),
        endAt: addDays(today, 20),
    }).returning();

    const [unitTests] = await db.insert(tasks).values({
        title: 'Unit Testing',
        parentId: testing.id,
        status: 'planned',
        category: 'work',
        startAt: addDays(today, 10),
        endAt: addDays(today, 13),
    }).returning();

    const [e2eTests] = await db.insert(tasks).values({
        title: 'E2E Testing',
        parentId: testing.id,
        status: 'planned',
        category: 'work',
        startAt: addDays(today, 13),
        endAt: addDays(today, 17),
    }).returning();

    const [performanceTests] = await db.insert(tasks).values({
        title: 'Performance Testing',
        parentId: testing.id,
        status: 'planned',
        category: 'work',
        startAt: addDays(today, 17),
        endAt: addDays(today, 20),
    }).returning();

    // Phase 4: Deployment (PLANNED)
    const [deployment] = await db.insert(tasks).values({
        title: 'Phase 4: Deployment',
        parentId: productLaunch.id,
        status: 'planned',
        category: 'work',
        startAt: addDays(today, 20),
        endAt: addDays(today, 30),
    }).returning();

    const [infraSetup] = await db.insert(tasks).values({
        title: 'Infrastructure Setup',
        parentId: deployment.id,
        status: 'planned',
        category: 'work',
        startAt: addDays(today, 20),
        endAt: addDays(today, 23),
        customProperties: [
            { key: 'Cloud Provider', value: 'AWS', type: 'text' },
            { key: 'Budget', value: '$5000/month', type: 'text' },
        ]
    }).returning();

    const [cicdPipeline] = await db.insert(tasks).values({
        title: 'CI/CD Pipeline',
        parentId: deployment.id,
        status: 'planned',
        category: 'work',
        startAt: addDays(today, 23),
        endAt: addDays(today, 26),
    }).returning();

    const [prodDeploy] = await db.insert(tasks).values({
        title: 'Production Deployment',
        parentId: deployment.id,
        status: 'planned',
        category: 'work',
        startAt: addDays(today, 26),
        endAt: addDays(today, 30),
    }).returning();

    // Project 2: Personal Development
    const [personalDev] = await db.insert(tasks).values({
        title: 'Q1 Personal Development',
        objective: 'Improve technical and soft skills',
        status: 'doing',
        category: 'life',
        startAt: subDays(today, 14),
        endAt: addWeeks(today, 8),
    }).returning();

    const [techSkills] = await db.insert(tasks).values({
        title: 'Technical Skills',
        parentId: personalDev.id,
        status: 'doing',
        category: 'life',
    }).returning();

    const [learnRust] = await db.insert(tasks).values({
        title: 'Learn Rust Programming',
        parentId: techSkills.id,
        status: 'doing',
        category: 'life',
        customProperties: [
            { key: 'Course', value: 'https://www.rust-lang.org/learn', type: 'url' },
            { key: 'Progress', value: '40%', type: 'text' },
        ]
    }).returning();

    const [systemDesign] = await db.insert(tasks).values({
        title: 'System Design Study',
        parentId: techSkills.id,
        status: 'doing',
        category: 'life',
    }).returning();

    const [healthFitness] = await db.insert(tasks).values({
        title: 'Health & Fitness',
        parentId: personalDev.id,
        status: 'doing',
        category: 'life',
    }).returning();

    const [morningRun] = await db.insert(tasks).values({
        title: 'Daily Morning Run (30min)',
        parentId: healthFitness.id,
        status: 'doing',
        category: 'life',
    }).returning();

    const [gymRoutine] = await db.insert(tasks).values({
        title: 'Gym Routine (3x/week)',
        parentId: healthFitness.id,
        status: 'doing',
        category: 'life',
    }).returning();

    const [reading] = await db.insert(tasks).values({
        title: 'Reading & Learning',
        parentId: personalDev.id,
        status: 'doing',
        category: 'life',
    }).returning();

    const [atomicHabits] = await db.insert(tasks).values({
        title: 'Read "Atomic Habits"',
        parentId: reading.id,
        status: 'doing',
        category: 'life',
        customProperties: [
            { key: 'Pages Read', value: '120/320', type: 'text' },
        ]
    }).returning();

    // ===== TASK DEPENDENCIES =====
    await db.insert(taskDependencies).values([
        { predecessorId: authModule.id, successorId: dataLayer.id },
        { predecessorId: dataLayer.id, successorId: apiEndpoints.id },
        { predecessorId: uiComponents.id, successorId: dashboardViews.id },
        { predecessorId: dashboardViews.id, successorId: userSettings.id },
        { predecessorId: userSettings.id, successorId: integration.id },
        { predecessorId: apiEndpoints.id, successorId: integration.id },
        { predecessorId: development.id, successorId: testing.id },
        { predecessorId: testing.id, successorId: deployment.id },
    ]);

    // ===== TIME BLOCKS =====

    // Monday
    const [mondayMorning] = await db.insert(timeBlocks).values({
        title: 'Deep Work: Backend Development',
        startAt: setMinutes(setHours(addDays(startOfWk, 0), 9), 0),
        endAt: setMinutes(setHours(addDays(startOfWk, 0), 12), 0),
        type: 'plan',
        notes: 'Focus on data layer implementation',
    }).returning();

    await db.insert(taskToTimeBlocks).values([
        { taskId: dataLayer.id, timeBlockId: mondayMorning.id },
    ]);

    const [mondayAfternoon] = await db.insert(timeBlocks).values({
        title: 'Team Standup + Code Review',
        startAt: setMinutes(setHours(addDays(startOfWk, 0), 14), 0),
        endAt: setMinutes(setHours(addDays(startOfWk, 0), 16), 0),
        type: 'plan',
    }).returning();

    // Tuesday
    const [tuesdayMorning] = await db.insert(timeBlocks).values({
        title: 'Frontend Development',
        startAt: setMinutes(setHours(addDays(startOfWk, 1), 9), 0),
        endAt: setMinutes(setHours(addDays(startOfWk, 1), 12), 0),
        type: 'plan',
    }).returning();

    await db.insert(taskToTimeBlocks).values([
        { taskId: dashboardViews.id, timeBlockId: tuesdayMorning.id },
    ]);

    const [tuesdayEvening] = await db.insert(timeBlocks).values({
        title: 'Personal Study Time',
        startAt: setMinutes(setHours(addDays(startOfWk, 1), 19), 0),
        endAt: setMinutes(setHours(addDays(startOfWk, 1), 21), 0),
        type: 'plan',
        notes: 'Rust programming practice',
    }).returning();

    await db.insert(taskToTimeBlocks).values([
        { taskId: learnRust.id, timeBlockId: tuesdayEvening.id },
    ]);

    // Wednesday
    const [wednesdayMorning] = await db.insert(timeBlocks).values({
        title: 'Meetings & Planning',
        startAt: setMinutes(setHours(addDays(startOfWk, 2), 10), 0),
        endAt: setMinutes(setHours(addDays(startOfWk, 2), 12), 0),
        type: 'plan',
    }).returning();

    const [wednesdayAfternoon] = await db.insert(timeBlocks).values({
        title: 'Backend + Frontend Integration',
        startAt: setMinutes(setHours(addDays(startOfWk, 2), 14), 0),
        endAt: setMinutes(setHours(addDays(startOfWk, 2), 18), 0),
        type: 'plan',
    }).returning();

    await db.insert(taskToTimeBlocks).values([
        { taskId: dataLayer.id, timeBlockId: wednesdayAfternoon.id },
        { taskId: dashboardViews.id, timeBlockId: wednesdayAfternoon.id },
    ]);

    // Thursday
    const [thursdayMorning] = await db.insert(timeBlocks).values({
        title: 'System Design Study',
        startAt: setMinutes(setHours(addDays(startOfWk, 3), 9), 0),
        endAt: setMinutes(setHours(addDays(startOfWk, 3), 11), 0),
        type: 'plan',
    }).returning();

    await db.insert(taskToTimeBlocks).values([
        { taskId: systemDesign.id, timeBlockId: thursdayMorning.id },
    ]);

    // Friday
    const [fridayMorning] = await db.insert(timeBlocks).values({
        title: 'Sprint Review & Retrospective',
        startAt: setMinutes(setHours(addDays(startOfWk, 4), 10), 0),
        endAt: setMinutes(setHours(addDays(startOfWk, 4), 12), 0),
        type: 'plan',
    }).returning();

    const [fridayAfternoon] = await db.insert(timeBlocks).values({
        title: 'Documentation & Cleanup',
        startAt: setMinutes(setHours(addDays(startOfWk, 4), 14), 0),
        endAt: setMinutes(setHours(addDays(startOfWk, 4), 17), 0),
        type: 'plan',
    }).returning();

    // Daily Morning Runs (Actual blocks)
    for (let i = 0; i < 5; i++) {
        const [runBlock] = await db.insert(timeBlocks).values({
            title: 'Morning Run',
            startAt: setMinutes(setHours(addDays(startOfWk, i), 6), 30),
            endAt: setMinutes(setHours(addDays(startOfWk, i), 7), 0),
            type: 'actual',
            notes: 'Completed 5km',
        }).returning();

        await db.insert(taskToTimeBlocks).values([
            { taskId: morningRun.id, timeBlockId: runBlock.id },
        ]);
    }

    // ===== COMMENTS =====
    await db.insert(comments).values([
        {
            taskId: dataLayer.id,
            senderId: 'Alice',
            content: 'Making good progress on the ORM integration. Should be done by EOD.',
        },
        {
            taskId: dataLayer.id,
            senderId: 'Bob',
            content: '@Alice Great! Let me know when you need code review.',
        },
        {
            taskId: dashboardViews.id,
            senderId: 'Charlie',
            content: 'The new dashboard looks amazing! 🎉',
        },
        {
            taskId: apiEndpoints.id,
            senderId: 'Alice',
            content: 'Waiting for data layer completion before starting this.',
        },
    ]);

    console.log('✅ Successfully seeded comprehensive data:');
    console.log(`   - ${await db.select().from(tasks).then(r => r.length)} tasks`);
    console.log(`   - ${await db.select().from(timeBlocks).then(r => r.length)} time blocks`);
    console.log(`   - ${await db.select().from(taskDependencies).then(r => r.length)} dependencies`);
    console.log(`   - ${await db.select().from(comments).then(r => r.length)} comments`);

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
