-- Add gender column to students table
ALTER TABLE public.students 
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female'));

-- Create guardians table for parent/guardian information
CREATE TABLE public.guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  relation TEXT NOT NULL CHECK (relation IN ('father', 'mother', 'guardian', 'other')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on guardians table
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Guardians policies
CREATE POLICY "Admins can manage guardians"
ON public.guardians
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can view guardians"
ON public.guardians
FOR SELECT
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates on guardians
CREATE TRIGGER update_guardians_updated_at
BEFORE UPDATE ON public.guardians
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster guardian lookups by student
CREATE INDEX idx_guardians_student_id ON public.guardians(student_id);