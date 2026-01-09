import { AccessControlProvider } from "@refinedev/core";
import { createMongoAbility } from "@casl/ability";
import { trpcClient } from "./trpc";

// Cache the ability promise to avoid redundant requests
let abilityPromise: Promise<any> | null = null;

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action, params }) => {
        if (!abilityPromise) {
            // Fetch roles from backend
            abilityPromise = trpcClient.auth.permissions.query()
                .then((rules: any) => createMongoAbility(rules))
                .catch((err) => {
                    console.error("Failed to fetch permissions", err);
                    return createMongoAbility([]); // Default to no permissions on error
                });
        }

        const ability = await abilityPromise;
        const can = ability.can(action, resource, params);

        return {
            can,
            reason: can ? undefined : "Unauthorized",
        };
    },
    options: {
        buttons: {
            enableAccessControl: true,
            hideIfUnauthorized: true,
        },
    },
};
