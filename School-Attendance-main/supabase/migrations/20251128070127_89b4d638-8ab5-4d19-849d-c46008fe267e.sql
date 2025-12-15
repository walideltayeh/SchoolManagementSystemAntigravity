-- Add is_all_day column to periods table
ALTER TABLE periods ADD COLUMN is_all_day BOOLEAN DEFAULT false NOT NULL;