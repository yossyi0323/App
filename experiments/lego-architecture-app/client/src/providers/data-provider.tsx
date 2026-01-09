import type { DataProvider } from "@refinedev/core";
// import { trpc } from "./trpc";
// import { TRPCClientError } from "@trpc/client";

// We need a way to access the tRPC client instance outside of hooks if strictly following DataProvider interface which is not a hook.
// However, Refine DataProvider is usually valid as an object.
// But tRPC react client is hook-based. 
// For Refine, it is often better to use the vanilla tRPC client or create a wrapper.
// Let's use the vanilla client for the Data Provider methods.

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@lego-app/server';
// import superjson from 'superjson'; 
// We will use standard JSON for now as verified in server setup (no superjson transformer added).

const client = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: 'http://localhost:3000/trpc',
        }),
    ],
});

export const dataProvider: DataProvider = {
    getList: async ({ resource }) => {
        if (resource === "items") {
            const data = await client.items.list.query();
            // Client side pagination for now as per repository implementation
            return {
                data: data as any[],
                total: data.length,
            };
        }
        return { data: [], total: 0 };
    },

    getOne: async ({ resource, id }) => {
        if (resource === "items") {
            const data = await client.items.get.query({ id: id as string });
            return { data: data as any };
        }
        throw new Error("Not implemented");
    },

    create: async ({ resource, variables }) => {
        if (resource === "items") {
            const data = await client.items.create.mutate(variables as any);
            return { data: data as any };
        }
        throw new Error("Not implemented");
    },

    update: async ({ resource, id, variables }) => {
        if (resource === "items") {
            const data = await client.items.update.mutate({
                id: id as string,
                data: variables as any
            });
            return { data: data as any };
        }
        throw new Error("Not implemented");
    },

    deleteOne: async ({ resource, id }) => {
        if (resource === "items") {
            await client.items.delete.mutate({ id: id as string });
            return { data: {} as any };
        }
        throw new Error("Not implemented");
    },

    getApiUrl: () => "http://localhost:3000/trpc",

    // Optional methods left unimplemented for now
};
