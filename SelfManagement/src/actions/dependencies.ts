'use server';

import { db } from '@/db';
import { taskDependencies } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addDependency(predecessorId: string, successorId: string) {
    if (predecessorId === successorId) throw new Error("Cannot depend on self");

    await db.insert(taskDependencies).values({
        predecessorId,
        successorId,
    });
    revalidatePath('/');
}

export async function removeDependency(predecessorId: string, successorId: string) {
    await db.delete(taskDependencies)
        .where(and(
            eq(taskDependencies.predecessorId, predecessorId),
            eq(taskDependencies.successorId, successorId)
        ));
    revalidatePath('/');
}
