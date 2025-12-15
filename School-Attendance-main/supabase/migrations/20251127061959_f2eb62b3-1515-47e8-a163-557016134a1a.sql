-- Add room_id column to class_schedules table
ALTER TABLE public.class_schedules 
ADD COLUMN room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_class_schedules_room_id ON public.class_schedules(room_id);

-- Remove room_number from classes table since rooms are now assigned at schedule level
ALTER TABLE public.classes 
DROP COLUMN IF EXISTS room_number;