-- Add address column to students table
ALTER TABLE public.students 
ADD COLUMN address TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.students.address IS 'Student home address used for bus pickup/dropoff';