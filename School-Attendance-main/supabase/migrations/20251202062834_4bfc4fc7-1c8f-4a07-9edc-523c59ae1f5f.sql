-- Fix RLS policies for periods table to allow anyone to insert/update/delete
-- This is needed for the admin interface to work

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations on periods" ON public.periods;

-- Create policy to allow all operations on periods table
CREATE POLICY "Allow all operations on periods"
ON public.periods
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure teachers table also has proper policies for insert/update/delete
DROP POLICY IF EXISTS "Allow all operations on teachers" ON public.teachers;

CREATE POLICY "Allow all operations on teachers"
ON public.teachers
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure classes table has proper policies
DROP POLICY IF EXISTS "Allow all operations on classes" ON public.classes;

CREATE POLICY "Allow all operations on classes"
ON public.classes
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure class_schedules table has proper policies
DROP POLICY IF EXISTS "Allow all operations on class_schedules" ON public.class_schedules;

CREATE POLICY "Allow all operations on class_schedules"
ON public.class_schedules
FOR ALL
TO public
USING (true)
WITH CHECK (true);