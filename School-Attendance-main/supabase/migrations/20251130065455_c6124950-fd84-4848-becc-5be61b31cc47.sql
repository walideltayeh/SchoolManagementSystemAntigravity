-- Add month field to class_schedules table
ALTER TABLE class_schedules 
ADD COLUMN month INTEGER CHECK (month >= 1 AND month <= 12);