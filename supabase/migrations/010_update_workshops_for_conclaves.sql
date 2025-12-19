-- Migration: Add Conclave specific fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conclave_type') THEN
        CREATE TYPE conclave_type AS ENUM ('AUDIO', 'VIDEO');
    END IF;
END $$;

ALTER TABLE workshops 
ADD COLUMN IF NOT EXISTS type conclave_type DEFAULT 'VIDEO',
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

