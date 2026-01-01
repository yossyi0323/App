"use server"

import { db } from '@/db';
import { timeBlocks, tasks } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function getTimeBlocks(start: Date, end: Date) {
    const blocks = await db.query.timeBlocks.findMany({
        where: and(
            gte(timeBlocks.startAt, start),
            lte(timeBlocks.endAt, end)
        ),
        with: {
            task: true
        }
    });
    return blocks;
}

export async function createTimeBlock(formData: FormData) {
    // TODO: Implement creation logic
}
