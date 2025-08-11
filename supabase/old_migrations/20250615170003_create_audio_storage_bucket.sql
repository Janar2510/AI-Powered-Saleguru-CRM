-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-files',
  'audio-files',
  true,
  104857600, -- 100MB limit
  ARRAY['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/mp3', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for audio files
CREATE POLICY "Users can upload audio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view audio files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'audio-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update audio files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'audio-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete audio files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'audio-files' AND
    auth.role() = 'authenticated'
  ); 