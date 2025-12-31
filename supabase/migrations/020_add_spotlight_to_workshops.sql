-- Migration: Add spotlight_user_id to workshops
ALTER TABLE workshops 
ADD COLUMN IF NOT EXISTS spotlight_user_id UUID REFERENCES auth.users(id);

-- Ensure Realtime is enabled for workshops table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'workshops'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE workshops;
    END IF;
END $$;

-- Update RLS policies to allow hosts and admins to update the spotlight
-- First, drop the old policy if it exists (it was created in 008)
DROP POLICY IF EXISTS "Hosts can update their own workshops" ON workshops;

-- Create a new policy that includes admins
CREATE POLICY "Hosts and admins can update workshops" 
ON workshops FOR UPDATE 
USING (
  auth.uid() = host_id 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = host_id 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

