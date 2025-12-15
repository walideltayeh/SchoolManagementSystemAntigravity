-- Make user_id nullable in teachers table since we're removing auth requirement
ALTER TABLE public.teachers ALTER COLUMN user_id DROP NOT NULL;