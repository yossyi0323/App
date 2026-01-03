'use server';

import { db } from '@/db';
import { comments, notifications } from '@/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getComments(taskId?: string, timeBlockId?: string) {
    if (!taskId && !timeBlockId) return [];

    const conditions = [];
    if (taskId) conditions.push(eq(comments.taskId, taskId));
    if (timeBlockId) conditions.push(eq(comments.timeBlockId, timeBlockId));

    return await db.query.comments.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(comments.createdAt)],
    });
}

export async function addComment(formData: FormData) {
    const taskId = formData.get('taskId') as string | null;
    const timeBlockId = formData.get('timeBlockId') as string | null;
    const content = formData.get('content') as string;
    const senderId = "Current User"; // Placeholder

    if (!content) return;

    await db.insert(comments).values({
        taskId: taskId || null,
        timeBlockId: timeBlockId || null,
        senderId,
        content,
    });

    // Check for mentions (e.g., @User)
    const mentions = content.match(/@(\w+)/g);
    if (mentions) {
        for (const mention of mentions) {
            const userName = mention.substring(1);
            await db.insert(notifications).values({
                userId: userName,
                type: 'mention',
                content: `You were mentioned in a comment: "${content.substring(0, 30)}..."`,
                sourceId: taskId || timeBlockId || undefined,
            });
        }
    }

    if (taskId) revalidatePath(`/tasks/${taskId}`);
    revalidatePath('/');
}

export async function getNotifications(userId?: string) {
    // Return empty array if no valid userId is provided (authentication not yet implemented)
    if (!userId || userId === "Current User") {
        return [];
    }

    return await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: [desc(notifications.createdAt)],
    });
}

export async function markNotificationRead(id: string) {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
    revalidatePath('/');
}
