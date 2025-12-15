-- Temporarily allow public access to subjects table for testing
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Everyone can view subjects" ON public.subjects;

-- Allow anyone authenticated or not to manage subjects (temporary for development)
CREATE POLICY "Public can manage subjects"
  ON public.subjects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also make classes publicly accessible for now
DROP POLICY IF EXISTS "Admins and teachers can manage classes" ON public.classes;
DROP POLICY IF EXISTS "Everyone can view classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can view their classes" ON public.classes;

CREATE POLICY "Public can manage classes"
  ON public.classes
  FOR ALL
  USING (true)
  WITH CHECK (true);