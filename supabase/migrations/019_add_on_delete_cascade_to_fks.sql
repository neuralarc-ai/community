-- Update 'workshops' table to cascade deletes from 'auth.users'
ALTER TABLE public.workshops
DROP CONSTRAINT workshops_host_id_fkey,
ADD CONSTRAINT workshops_host_id_fkey
FOREIGN KEY (host_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;