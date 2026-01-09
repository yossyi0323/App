import { router, publicProcedure } from '../trpc.js';
import { z } from 'zod';
import { ItemRepository } from '../repositories/itemRepository.js';
import { createDynamicSchema } from '../utils/schemaFactory.js';
import { TRPCError } from '@trpc/server';

const repository = new ItemRepository();

export const itemsRouter = router({
    list: publicProcedure
        .query(async ({ ctx }) => {
            if (ctx.ability.cannot('read', 'items')) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
            }
            return repository.findAll();
        }),

    create: publicProcedure
        .input(z.record(z.string(), z.any())) // Validate strictly inside
        .mutation(async ({ ctx, input }) => {
            if (ctx.ability.cannot('create', 'items')) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
            }
            // Dynamic validation
            const dynamicSchema = await createDynamicSchema();
            const parsedData = dynamicSchema.parse(input);

            return repository.create(parsedData);
        }),

    get: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            if (ctx.ability.cannot('read', 'items')) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
            }
            const item = await repository.findById(input.id);
            if (!item) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Item not found' });
            }
            return item;
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string(),
            data: z.record(z.string(), z.any())
        }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.ability.cannot('update', 'items')) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
            }
            // In a real app, validate dynamic data again
            return repository.update(input.id, input.data);
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.ability.cannot('delete', 'items')) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
            }
            return repository.delete(input.id);
        }),
});
