
-- Make recorded_by nullable since classroom devices don't require authentication
ALTER TABLE attendance_records 
ALTER COLUMN recorded_by DROP NOT NULL;

-- Add a comment to explain this design decision
COMMENT ON COLUMN attendance_records.recorded_by IS 'User ID who recorded the attendance. Nullable for classroom device attendance where no user authentication is required.';
