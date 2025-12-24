-- supabase/migrations/015_add_email_to_profiles.sql
ALTER TABLE profiles
ADD COLUMN email TEXT UNIQUE;
