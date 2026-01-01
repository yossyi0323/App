'use server';

import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateTaskDates(id: string, startAt: Date | null, endAt: Date | null) {
    await db.update(tasks)
        .set({ startAt, endAt })
        .where(eq(tasks.id, id));
    revalidatePath('/');
}
