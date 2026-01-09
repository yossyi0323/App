import 'dotenv/config';
import { db } from '../src/db/index.js';
import { itemMetas, dataTypeEnum } from '../src/db/schema.js';

async function seed() {
    console.log('Checking item metas...');
    const metas = await db.select().from(itemMetas);

    if (metas.length === 0) {
        console.log('Seeding item metas...');
        await db.insert(itemMetas).values([
            { id: crypto.randomUUID(), key: 'name', label: 'Set Name', dataType: 'STRING', isRequired: true },
            { id: crypto.randomUUID(), key: 'number', label: 'Set Number', dataType: 'NUMBER', isRequired: true },
            { id: crypto.randomUUID(), key: 'pieces', label: 'Piece Count', dataType: 'NUMBER', isRequired: false },
            { id: crypto.randomUUID(), key: 'releaseDate', label: 'Release Date', dataType: 'DATE', isRequired: false },
            {
                id: crypto.randomUUID(), key: 'difficulty', label: 'Difficulty', dataType: 'SELECT', isRequired: false, options: [
                    { label: 'Easy', value: 'easy' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'Hard', value: 'hard' }
                ]
            }
        ]);
        console.log('Seeded metas.');
    } else {
        console.log('Metas already exist.');
    }

    process.exit(0);
}

seed().catch(console.error);
