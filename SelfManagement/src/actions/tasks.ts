'use server';

import { db } from '@/db';
import { tasks, taskDependencies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
    const allTasks = await db.select().from(tasks).orderBy(tasks.startAt);
    const allDeps = await db.select().from(taskDependencies);

    // Attach dependencies to tasks
    return allTasks.map(t => ({
        ...t,
        dependencies: allDeps.filter(d => d.successorId === t.id).map(d => d.predecessorId),
    }));
}

export async function createTask(formData: FormData) {
    const title = formData.get('title') as string;
    const parentId = formData.get('parentId') as string | null;

    if (!title) throw new Error('Title is required');

    await db.insert(tasks).values({
        title,
        parentId: parentId || null,
        status: 'planned',
    });

    revalidatePath('/');
}

export async function updateTaskStatus(id: string, status: 'planned' | 'doing' | 'waiting' | 'reviewing' | 'done') {
    await db.update(tasks).set({ status }).where(eq(tasks.id, id));
    revalidatePath('/');
}

export async function deleteTask(id: string) {
    await db.delete(tasks).where(eq(tasks.id, id));
    revalidatePath('/');
}
