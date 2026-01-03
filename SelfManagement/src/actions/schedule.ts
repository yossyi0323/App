"use server"

import { db } from '@/db';
import { timeBlocks, tasks, taskToTimeBlocks } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

import { revalidatePath } from 'next/cache';

export async function getTimeBlocks(start: Date, end: Date) {
    const blocks = await db.query.timeBlocks.findMany({
        where: and(
            gte(timeBlocks.startAt, start),
            lte(timeBlocks.endAt, end)
        ),
        with: {
            taskToTimeBlocks: {
                with: {
                    task: true
                }
            }
        }
    });
    return blocks;
}

export async function updateTimeBlock(id: string, startAt: Date, endAt: Date) {
    await db.update(timeBlocks).set({
        startAt,
        endAt,
    }).where(eq(timeBlocks.id, id));
    revalidatePath('/schedule');
    revalidatePath('/');
}

export async function createTimeBlock(formData: FormData) {
    const title = formData.get('title') as string;
    const startAt = new Date(formData.get('startAt') as string);
    const endAt = new Date(formData.get('endAt') as string);
    const type = formData.get('type') as 'plan' | 'actual';
    const taskIdsStr = formData.get('taskIds') as string;

    let taskIds: string[] = [];
    try {
        if (taskIdsStr) {
            taskIds = JSON.parse(taskIdsStr);
        }
    } catch (e) {
        console.error("Failed to parse taskIds", e);
    }

    const [block] = await db.insert(timeBlocks).values({
        title,
        startAt,
        endAt,
        type,
    }).returning();

    // Link tasks
    if (taskIds.length > 0) {
        await db.insert(taskToTimeBlocks).values(
            taskIds.map((taskId: string) => ({
                taskId,
                timeBlockId: block.id
            }))
        );
    }

    revalidatePath('/schedule');
    revalidatePath('/');
    return block;
}
