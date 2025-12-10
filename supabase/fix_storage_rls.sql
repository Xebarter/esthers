/*
  Fix Storage RLS Policies for Image Uploads - COMPLETE SOLUTION
  
  This script removes all RLS restrictions on storage.objects.
  Run this in your Supabase SQL Editor with a SERVICE ROLE key or as admin.
  
  If you get "must be owner" error, you MUST run this as a service role key, not anon key.
*/

-- Ensure the images bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop ALL existing policies on storage.objects
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon insert" ON storage.objects;
DROP POLICY IF EXISTS "Permissive read access" ON storage.objects;
DROP POLICY IF EXISTS "Permissive insert access" ON storage.objects;
DROP POLICY IF EXISTS "Permissive update access" ON storage.objects;
DROP POLICY IF EXISTS "Permissive delete access" ON storage.objects;

-- Disable RLS completely on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Optional: Re-enable RLS with permissive policies if needed
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON storage.objects USING (true) WITH CHECK (true);
