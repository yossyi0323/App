import { router, publicProcedure } from '../trpc.js';
import { db } from '../db/index.js';
import { itemMetas } from '../db/schema.js';

export const metasRouter = router({
    list: publicProcedure.query(async () => {
        return await db.select().from(itemMetas);
    }),
});
