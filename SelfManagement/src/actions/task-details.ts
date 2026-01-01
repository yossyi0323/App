"use server"

import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateTaskDetails(id: string, formData: FormData) {
    const description = formData.get('description') as string;
    const objective = formData.get('objective') as string;
    const outputDefinition = formData.get('outputDefinition') as string;
    const category = formData.get('category') as any;
    const customPropertiesRaw = formData.get('customProperties') as string;

    let customProperties = null;
    if (customPropertiesRaw) {
        try {
            customProperties = JSON.parse(customPropertiesRaw);
        } catch (e) {
            console.error("Failed to parse customProperties", e);
        }
    }

    await db.update(tasks).set({
        description,
        objective,
        outputDefinition,
        category: category || null,
        customProperties
    }).where(eq(tasks.id, id));

    revalidatePath('/');
}
