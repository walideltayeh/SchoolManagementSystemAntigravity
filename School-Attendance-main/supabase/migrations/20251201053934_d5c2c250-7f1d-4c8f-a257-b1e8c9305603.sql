-- Allow student registration without authentication
-- This is needed for the student registration form to work

-- Drop existing INSERT-only policy if it exists
DROP POLICY IF EXISTS "Allow student registration" ON public.students;

-- Add policy to allow anyone to insert students (for registration)
CREATE POLICY "Allow student registration"
ON public.students
FOR INSERT
WITH CHECK (true);

-- Keep existing policies for SELECT and admin management unchanged