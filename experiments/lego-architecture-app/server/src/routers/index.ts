import { router, publicProcedure } from '../trpc.js';
import { z } from 'zod';
import { itemsRouter } from './items.js';
import { metasRouter } from './metas.js';

export const appRouter = router({
    hello: publicProcedure
        .input(z.object({ name: z.string().nullish() }))
        .query(({ input }) => {
            return {
                text: `Hello ${input?.name ?? 'world'}`,
            };
        }),
    items: itemsRouter,
    metas: metasRouter,
});

export type AppRouter = typeof appRouter;
