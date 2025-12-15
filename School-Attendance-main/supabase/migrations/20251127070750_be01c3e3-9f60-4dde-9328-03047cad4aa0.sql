-- Add QR code columns to students, teachers, and bus_routes
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS qr_code text UNIQUE DEFAULT ('STUDENT:' || gen_random_uuid()::text);

ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS qr_code text UNIQUE DEFAULT ('TEACHER:' || gen_random_uuid()::text);

ALTER TABLE public.bus_routes 
ADD COLUMN IF NOT EXISTS qr_code text UNIQUE DEFAULT ('BUS:' || gen_random_uuid()::text);

-- Update class_schedules QR code format to include schedule type
ALTER TABLE public.class_schedules 
ALTER COLUMN qr_code SET DEFAULT ('SCHEDULE:' || gen_random_uuid()::text);

-- Update attendance_records to support classroom and bus attendance
ALTER TABLE public.attendance_records
ADD COLUMN IF NOT EXISTS type text DEFAULT 'classroom' CHECK (type IN ('classroom', 'bus')),
ADD COLUMN IF NOT EXISTS schedule_id uuid REFERENCES public.class_schedules(id),
ADD COLUMN IF NOT EXISTS bus_route_id uuid REFERENCES public.bus_routes(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_attendance_type ON public.attendance_records(type);
CREATE INDEX IF NOT EXISTS idx_attendance_schedule ON public.attendance_records(schedule_id);
CREATE INDEX IF NOT EXISTS idx_students_qr ON public.students(qr_code);
CREATE INDEX IF NOT EXISTS idx_teachers_qr ON public.teachers(qr_code);
CREATE INDEX IF NOT EXISTS idx_bus_routes_qr ON public.bus_routes(qr_code);

-- Function to auto-generate QR codes for existing records
CREATE OR REPLACE FUNCTION generate_missing_qr_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update students without QR codes
  UPDATE public.students 
  SET qr_code = 'STUDENT:' || gen_random_uuid()::text 
  WHERE qr_code IS NULL;
  
  -- Update teachers without QR codes
  UPDATE public.teachers 
  SET qr_code = 'TEACHER:' || gen_random_uuid()::text 
  WHERE qr_code IS NULL;
  
  -- Update bus routes without QR codes
  UPDATE public.bus_routes 
  SET qr_code = 'BUS:' || gen_random_uuid()::text 
  WHERE qr_code IS NULL;
  
  -- Update class schedules without proper QR codes
  UPDATE public.class_schedules 
  SET qr_code = 'SCHEDULE:' || gen_random_uuid()::text 
  WHERE qr_code IS NULL OR qr_code NOT LIKE 'SCHEDULE:%';
END;
$$;

-- Execute the function to generate QR codes for existing records
SELECT generate_missing_qr_codes();

-- Create function to validate student attendance
CREATE OR REPLACE FUNCTION validate_student_attendance(
  _student_qr text,
  _schedule_id uuid,
  _recorded_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _student_id uuid;
  _class_id uuid;
  _is_enrolled boolean;
  _schedule_data record;
  _current_day text;
  _current_time time;
  result jsonb;
BEGIN
  -- Extract student ID from QR code
  _student_id := (
    SELECT id FROM public.students 
    WHERE qr_code = _student_qr AND status = 'active'
  );
  
  IF _student_id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid student QR code');
  END IF;
  
  -- Get schedule details
  SELECT cs.*, c.id as class_id, c.name as class_name, c.grade, c.section
  INTO _schedule_data
  FROM public.class_schedules cs
  JOIN public.classes c ON cs.class_id = c.id
  WHERE cs.id = _schedule_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid schedule');
  END IF;
  
  -- Check if student is enrolled in this class
  _is_enrolled := EXISTS (
    SELECT 1 FROM public.class_enrollments
    WHERE student_id = _student_id AND class_id = _schedule_data.class_id
  );
  
  IF NOT _is_enrolled THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Student not enrolled in this class');
  END IF;
  
  -- Get current day and time
  _current_day := LOWER(TO_CHAR(CURRENT_DATE, 'Day'));
  _current_time := CURRENT_TIME;
  
  -- Validate day (optional - can be strict or lenient)
  -- IF _current_day != LOWER(_schedule_data.day::text) THEN
  --   RETURN jsonb_build_object('valid', false, 'error', 'Not scheduled for today');
  -- END IF;
  
  -- Return success with student info
  RETURN jsonb_build_object(
    'valid', true,
    'student_id', _student_id,
    'class_id', _schedule_data.class_id,
    'schedule_id', _schedule_id,
    'student_name', (SELECT full_name FROM public.students WHERE id = _student_id),
    'class_name', _schedule_data.class_name,
    'grade', _schedule_data.grade,
    'section', _schedule_data.section
  );
END;
$$;