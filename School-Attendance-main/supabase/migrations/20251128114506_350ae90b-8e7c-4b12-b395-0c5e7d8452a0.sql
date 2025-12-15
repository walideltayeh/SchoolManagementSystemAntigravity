-- Make class_id nullable in attendance_records for bus attendance
ALTER TABLE public.attendance_records 
ALTER COLUMN class_id DROP NOT NULL;