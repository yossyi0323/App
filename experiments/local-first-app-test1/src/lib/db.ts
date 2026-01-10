import { PGlite } from "@electric-sql/pglite";
import { electricSync } from "@electric-sql/pglite-sync";
import { live } from "@electric-sql/pglite/live";

// Initialize PGLite with persistence (IndexedDB) and Electric Sync
const dbUrl = "idb://local-first-db-v9";
console.log("Initializing DB at:", dbUrl);

export const db = new PGlite(dbUrl, {
    extensions: {
        electric: electricSync({
            debug: true,
        }),
        live,
    },
}) as any;
