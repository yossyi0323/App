'use server';

import { db } from '@/db';
import { tasks, taskDependencies } from '@/db/schema';
import { eq, and, or, ilike, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type TaskFilters = {
    search?: string;
    status?: string;
    category?: string;
    parentId?: string | null;
    customPropKey?: string;
    customPropValue?: string;
    customPropEmpty?: boolean;
};

export async function getTasks(filters: TaskFilters = {}) {
    const conditions = [];

    if (filters.search) {
        conditions.push(or(
            ilike(tasks.title, `%${filters.search}%`),
            ilike(tasks.description, `%${filters.search}%`)
        ));
    }

    if (filters.status && filters.status !== 'all') {
        conditions.push(eq(tasks.status, filters.status as any));
    }

    if (filters.category) {
        conditions.push(eq(tasks.category, filters.category as any));
    }

    if (filters.parentId !== undefined) {
        if (filters.parentId === null) {
            conditions.push(sql`${tasks.parentId} IS NULL`);
        } else {
            conditions.push(eq(tasks.parentId, filters.parentId));
        }
    }

    // JSONB Filtering logic for array of objects: [{key, value, type}]
    if (filters.customPropKey) {
        if (filters.customPropEmpty) {
            // Find tasks where the key exists but value is empty or the key doesn't exist at all
            // This is a bit complex in SQL, so we'll use a simplified check for "value is empty" if key exists
            conditions.push(sql`EXISTS (
                SELECT 1 FROM jsonb_array_elements(${tasks.customProperties}) as elem 
                WHERE elem->>'key' = ${filters.customPropKey} AND (elem->>'value' = '' OR elem->>'value' IS NULL)
            )`);
        } else if (filters.customPropValue) {
            conditions.push(sql`${tasks.customProperties} @> ${JSON.stringify([{ key: filters.customPropKey, value: filters.customPropValue }])}::jsonb`);
        }
    }

    const allTasks = await db.query.tasks.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: (tasks, { asc }) => [asc(tasks.startAt)],
        with: {
            taskToTimeBlocks: {
                with: {
                    timeBlock: true
                }
            },
            dependencies: true
        }
    });

    return allTasks.map(t => ({
        ...t,
        dependencies: t.dependencies.map(d => d.predecessorId),
        linkedTimeBlocks: t.taskToTimeBlocks.map(tt => tt.timeBlock)
    }));
}

export async function getTaskById(id: string) {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
        with: {
            taskToTimeBlocks: {
                with: {
                    timeBlock: true
                }
            },
            dependencies: {
                with: {
                    predecessor: true
                }
            }
        }
    });

    if (!task) return null;

    return {
        ...task,
        dependencies: task.dependencies.map(d => d.predecessorId),
        linkedTimeBlocks: task.taskToTimeBlocks.map(tt => tt.timeBlock)
    };
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
    await db.update(tasks).set({ status, updatedAt: new Date() }).where(eq(tasks.id, id));
    revalidatePath('/');
}

export async function updateTaskDates(id: string, startAt: Date | null, endAt: Date | null) {
    await db.update(tasks).set({
        startAt,
        endAt,
        updatedAt: new Date()
    }).where(eq(tasks.id, id));
    revalidatePath('/');
    revalidatePath('/board');
    revalidatePath('/gantt');
}

export async function deleteTask(id: string) {
    await db.delete(tasks).where(eq(tasks.id, id));
    revalidatePath('/');
}
