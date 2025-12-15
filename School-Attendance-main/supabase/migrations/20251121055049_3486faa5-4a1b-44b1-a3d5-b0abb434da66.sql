-- Add qr_code column to class_schedules table
ALTER TABLE class_schedules 
ADD COLUMN qr_code TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Create index for faster QR code lookups
CREATE INDEX idx_class_schedules_qr_code ON class_schedules(qr_code);