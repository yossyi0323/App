-- Create Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Profiles table (for Presence/Cursors)
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Electric V1 requires a publication
-- We try to create it, ignoring error if exists (Postgres doesn't have IF NOT EXISTS for publication in older versions, but 14 does usually or we catch)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'electric_publication') THEN
        CREATE PUBLICATION electric_publication FOR ALL TABLES;
    END IF;
END
$$;
