-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Everyone can view subjects
CREATE POLICY "Everyone can view subjects"
  ON public.subjects
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins can manage subjects
CREATE POLICY "Admins can manage subjects"
  ON public.subjects
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;

-- Insert default subjects
INSERT INTO public.subjects (name) VALUES
  ('Math'),
  ('Science'),
  ('English'),
  ('Arabic'),
  ('Social Studies'),
  ('Art'),
  ('Music'),
  ('PE'),
  ('Computer Science'),
  ('ICT'),
  ('French'),
  ('Spanish'),
  ('Islamic Studies'),
  ('History'),
  ('Geography')
ON CONFLICT (name) DO NOTHING;