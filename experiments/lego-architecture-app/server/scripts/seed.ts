import 'dotenv/config';
import { db } from '../src/db/index.js';
import { itemMetas, items, itemValues, policies } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
    console.log('🌱 Starting Master Seed for Task Management Scenario...');

    // 1. Clear existing data (Order matters due to foreign keys if Cascading deletes aren't perfect, but Drizzle usually handles it if configured)
    // Actually, we should be careful. `itemValues` depends on `items` and `itemMetas`.
    console.log('🧹 Clearing old data...');
    await db.delete(itemValues);
    await db.delete(items);
    await db.delete(itemMetas);
    await db.delete(policies);

    // 2. Insert Item Metas (Definitions)
    console.log('📝 Seeding Item Metas...');
    const metaIds: Record<string, string> = {};

    const metasData = [
        { key: 'title', label: 'タイトル', dataType: 'STRING', isRequired: true, options: null },
        { key: 'status', label: '状態', dataType: 'SELECT', isRequired: true, options: [{ label: '未着手', value: '未着手' }, { label: '進行中', value: '進行中' }, { label: '完了', value: '完了' }] },
        { key: 'due_date', label: '期限', dataType: 'DATE', isRequired: false, options: null },
        { key: 'priority', label: '優先度', dataType: 'SELECT', isRequired: false, options: [{ label: '高', value: '高' }, { label: '中', value: '中' }, { label: '低', value: '低' }] },
    ];

    for (const meta of metasData) {
        const id = crypto.randomUUID();
        metaIds[meta.key] = id;
        await db.insert(itemMetas).values({
            id,
            key: meta.key, // cast to any if necessary, but schema should match
            label: meta.label,
            dataType: meta.dataType as any,
            isRequired: meta.isRequired,
            options: meta.options
        });
    }

    // 3. Insert Sample Items
    console.log('📦 Seeding Sample Items...');

    // Helper to insert an item
    const insertItem = async (values: Record<string, any>) => {
        const itemId = crypto.randomUUID();
        await db.insert(items).values({ id: itemId });

        for (const [key, value] of Object.entries(values)) {
            const metaId = metaIds[key];
            if (!metaId) continue;

            const entry: any = {
                id: crypto.randomUUID(),
                itemId,
                metaId: metaId,
            };

            // Determine column based on logic or definition?
            // Simplified logic: DATE -> valueDate, NUMBER -> valueInt/Float, Others -> valueString
            // We should look up the meta type, but here we hardcode knowledge since we just defined it.
            if (key === 'due_date') {
                entry.valueDate = new Date(value);
            } else if (key === 'priority' || key === 'status' || key === 'title') {
                entry.valueString = value;
            }

            await db.insert(itemValues).values(entry);
        }
    };

    await insertItem({
        title: 'サーバー構築',
        status: '進行中',
        priority: '高',
        due_date: '2026-01-15'
    });

    await insertItem({
        title: '要件定義',
        status: '完了', // Using matched value
        priority: '中',
        due_date: '2026-01-01'
    });

    // 4. Insert Policies
    console.log('🛡️ Seeding Policies...');
    await db.insert(policies).values([
        { id: crypto.randomUUID(), role: 'ADMIN', action: 'manage', subject: 'all', conditions: null },
        { id: crypto.randomUUID(), role: 'USER', action: 'read', subject: 'items', conditions: null },
        // "Update pending items only" - simplified condition example
        { id: crypto.randomUUID(), role: 'USER', action: 'update', subject: 'items', conditions: { status: '未着手' } }
    ]);

    console.log('✅ Seeding Complete!');
    process.exit(0);
}

seed().catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
});
