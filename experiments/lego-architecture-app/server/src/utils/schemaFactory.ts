import { z } from 'zod';
import { db } from '../db/index.js';
import { itemMetas } from '../db/schema.js';

export async function createDynamicSchema() {
    const metas = await db.select().from(itemMetas);

    const shape: Record<string, z.ZodTypeAny> = {};

    for (const meta of metas) {
        let validator: z.ZodTypeAny;

        switch (meta.dataType) {
            case 'STRING':
            case 'SELECT':
                validator = z.string();
                break;
            case 'NUMBER':
                validator = z.number(); // or z.coerce.number() if input comes from forms as string
                break;
            case 'DATE':
                validator = z.string().or(z.date()).pipe(z.coerce.date());
                break;
            default:
                validator = z.any();
        }

        if (meta.isRequired) {
            // refine for non-empty string etc?
            if (meta.dataType === 'STRING') validator = (validator as z.ZodString).min(1);
        } else {
            validator = validator.optional().nullable();
        }

        shape[meta.key] = validator;
    }

    return z.object(shape);
}
