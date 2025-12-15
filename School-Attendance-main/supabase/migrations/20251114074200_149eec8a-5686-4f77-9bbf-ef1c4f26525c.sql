-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true);

-- Create RLS policies for student photos bucket
CREATE POLICY "Anyone can view student photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');

CREATE POLICY "Anyone can upload student photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Anyone can update student photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'student-photos');

CREATE POLICY "Anyone can delete student photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'student-photos');

-- Add photo_url column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS photo_url TEXT;