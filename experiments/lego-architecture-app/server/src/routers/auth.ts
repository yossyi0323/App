import { publicProcedure, router } from '../trpc.js';
import { packRules } from '@casl/ability/extra';

export const authRouter = router({
    permissions: publicProcedure.query(({ ctx }) => {
        // Return the raw rules so the frontend can reconstruct the Ability
        // packRules compresses them, but for simplicity sending raw JSON is fine too if small.
        // ctx.ability.rules is what we want.
        return ctx.ability.rules;
    }),
});
