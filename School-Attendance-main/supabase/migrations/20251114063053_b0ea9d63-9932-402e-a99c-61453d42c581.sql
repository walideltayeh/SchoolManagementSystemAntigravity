-- Insert default subjects
INSERT INTO public.subjects (name) VALUES
  ('Mathematics'),
  ('English'),
  ('Science'),
  ('Social Studies'),
  ('Arabic'),
  ('Physical Education'),
  ('Art'),
  ('Music'),
  ('Computer Science'),
  ('Islamic Studies')
ON CONFLICT DO NOTHING;