import { PGlite } from "@electric-sql/pglite";
import { electricSync } from "@electric-sql/pglite-sync";
import { live } from "@electric-sql/pglite/live";
import { PostgrestClient } from "@supabase/postgrest-js";

// Generate a stable client ID for this session/app instance
// We export this so components can use it for origin tracking
export const myClientId = crypto.randomUUID();

// Initialize PGLite with persistence (IndexedDB) and Electric Sync
const dbUrl = "idb://local-first-db-v10";
console.log("Initializing DB at:", dbUrl);

export const db = new PGlite(dbUrl, {
    extensions: {
        electric: electricSync({
            debug: true,
        }),
        live,
    },
}) as any;

// PostgREST client for upstream writes
// Use relative path to Let Vite proxy handle it regardless of exact port
export const postgrest = new PostgrestClient(`${window.location.origin}/postgrest`);

// Initialize local PGlite with idempotency rules
async function initLocalDb() {
    try {
        await db.waitReady;

        // Ensure client_id column exists locally (Schema Patch)
        await db.exec(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='client_id') THEN
                    ALTER TABLE tasks ADD COLUMN client_id UUID;
                END IF;
            END $$;
        `);

        // This rule prevents "duplicate key" errors when sync tries to insert a record we already have locally.
        // It's a clean way to handle the "self-sync" conflict in Electric V1.
        await db.exec(`
            CREATE OR REPLACE RULE ignore_duplicate_inserts AS 
            ON INSERT TO tasks 
            WHERE EXISTS (SELECT 1 FROM tasks WHERE id = NEW.id) 
            DO INSTEAD NOTHING;
        `);
        console.log("Local PGlite idempotency rules applied.");
    } catch (e) {
        console.error("Failed to apply local rules:", e);
    }
}

initLocalDb();
