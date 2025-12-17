-- 1. Allow public access to view profile pictures
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile_pic');

-- 2. Allow authenticated users to upload their own profile pictures
-- This policy checks if the folder/filename starts with the user's ID
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'profile_pic' AND 
  (storage.foldername(name))[1] = auth.uid()::text OR 
  name LIKE auth.uid()::text || '%'
);

-- 3. Allow users to update/delete their own profile pictures
CREATE POLICY "Users can update/delete their own avatar" 
ON storage.objects FOR ALL 
TO authenticated 
USING (
  bucket_id = 'profile_pic' AND 
  (storage.foldername(name))[1] = auth.uid()::text OR 
  name LIKE auth.uid()::text || '%'
);