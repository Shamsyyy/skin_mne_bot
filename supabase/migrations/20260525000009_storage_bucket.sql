INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-files',
  'user-files',
  false,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY storage_user_files_select ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-files');

CREATE POLICY storage_user_files_insert ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'user-files');

CREATE POLICY storage_user_files_delete ON storage.objects
  FOR DELETE
  USING (bucket_id = 'user-files');
