-- Fix search_path for new functions
CREATE OR REPLACE FUNCTION generate_missing_qr_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION validate_student_attendance(
  _student_qr text,
  _schedule_id uuid,
  _recorded_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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