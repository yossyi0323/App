import { db } from '../db/index.js';
import { items, itemMetas, itemValues } from '../db/schema.js';
import { eq, inArray, and } from 'drizzle-orm';

export class ItemRepository {

    async findAll() {
        const allItems = await db.select().from(items);
        if (allItems.length === 0) return [];

        const itemIds = allItems.map(i => i.id);

        const values = await db.select().from(itemValues)
            .where(inArray(itemValues.itemId, itemIds));

        const metas = await db.select().from(itemMetas);
        const metaMap = new Map(metas.map(m => [m.id, m]));

        return allItems.map(item => {
            const itemVals = values.filter(v => v.itemId === item.id);
            const dynamicData: Record<string, any> = {};

            itemVals.forEach(v => {
                const meta = metaMap.get(v.metaId);
                if (!meta) return;

                let val: any = null;
                if (meta.dataType === 'STRING' || meta.dataType === 'SELECT') val = v.valueString;
                else if (meta.dataType === 'NUMBER') val = v.valueNumber;
                else if (meta.dataType === 'DATE') val = v.valueDate;

                dynamicData[meta.key] = val;
            });

            return { ...item, ...dynamicData };
        });
    }

    async create(data: Record<string, any>) {
        const id = crypto.randomUUID();
        await db.insert(items).values({ id }).returning();

        const metas = await db.select().from(itemMetas);
        const metaMap = new Map(metas.map(m => [m.key, m]));

        const valuesToInsert: any[] = [];

        for (const [key, value] of Object.entries(data)) {
            const meta = metaMap.get(key);
            if (!meta) continue;

            const valEntry: any = {
                id: crypto.randomUUID(),
                itemId: id,
                metaId: meta.id,
            };

            if (meta.dataType === 'STRING' || meta.dataType === 'SELECT') valEntry.valueString = String(value);
            else if (meta.dataType === 'NUMBER') valEntry.valueNumber = Number(value);
            else if (meta.dataType === 'DATE') valEntry.valueDate = new Date(value as string);

            valuesToInsert.push(valEntry);
        }

        if (valuesToInsert.length > 0) {
            await db.insert(itemValues).values(valuesToInsert);
        }

        return this.findById(id);
    }

    async findById(id: string) {
        const item = await db.query.items.findFirst({
            where: eq(items.id, id)
        });
        if (!item) return null;

        const values = await db.select().from(itemValues).where(eq(itemValues.itemId, id));
        const metas = await db.select().from(itemMetas);
        const metaMap = new Map(metas.map(m => [m.id, m]));

        const dynamicData: Record<string, any> = {};
        values.forEach(v => {
            const meta = metaMap.get(v.metaId);
            if (!meta) return;

            let val: any = null;
            if (meta.dataType === 'STRING' || meta.dataType === 'SELECT') val = v.valueString;
            else if (meta.dataType === 'NUMBER') val = v.valueNumber;
            else if (meta.dataType === 'DATE') val = v.valueDate;

            dynamicData[meta.key] = val;
        });

        return { ...item, ...dynamicData };
    }

    async update(id: string, data: Record<string, any>) {
        const existingItem = await this.findById(id);
        if (!existingItem) {
            throw new Error('Item not found');
        }

        const metas = await db.select().from(itemMetas);
        const metaMap = new Map(metas.map(m => [m.key, m]));

        for (const [key, value] of Object.entries(data)) {
            const meta = metaMap.get(key);
            if (!meta) continue;

            // Delete existing value for this meta and item
            await db.delete(itemValues)
                .where(and(
                    eq(itemValues.itemId, id),
                    eq(itemValues.metaId, meta.id)
                ));

            // Insert new value
            const valEntry: any = {
                id: crypto.randomUUID(),
                itemId: id,
                metaId: meta.id,
            };

            if (meta.dataType === 'STRING' || meta.dataType === 'SELECT') valEntry.valueString = String(value);
            else if (meta.dataType === 'NUMBER') valEntry.valueNumber = Number(value);
            else if (meta.dataType === 'DATE') valEntry.valueDate = new Date(value as string);

            await db.insert(itemValues).values(valEntry);
        }

        return this.findById(id);
    }

    async delete(id: string) {
        await db.delete(itemValues).where(eq(itemValues.itemId, id));
        await db.delete(items).where(eq(items.id, id));
        return { success: true };
    }
}
