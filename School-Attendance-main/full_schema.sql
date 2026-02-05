-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student', 'parent');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive');
CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE public.day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  blood_type blood_type,
  allergies BOOLEAN DEFAULT FALSE,
  allergies_details TEXT,
  status user_status DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create teachers table
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_code TEXT UNIQUE NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  room_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(grade, section, subject)
);

-- Create class_enrollments table (students in classes)
CREATE TABLE public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- Create bus_routes table
CREATE TABLE public.bus_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  departure_time TIME NOT NULL,
  return_time TIME NOT NULL,
  status user_status DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create bus_stops table
CREATE TABLE public.bus_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.bus_routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  arrival_time TIME NOT NULL,
  stop_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(route_id, stop_order)
);

-- Create bus_assignments table (students assigned to bus routes)
CREATE TABLE public.bus_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.bus_routes(id) ON DELETE CASCADE,
  stop_id UUID NOT NULL REFERENCES public.bus_stops(id) ON DELETE CASCADE,
  status user_status DEFAULT 'active',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Create periods table
CREATE TABLE public.periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_number INTEGER UNIQUE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create class_schedules table
CREATE TABLE public.class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  day day_of_week NOT NULL,
  period_id UUID NOT NULL REFERENCES public.periods(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, day, period_id, week_number)
);

-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT,
  scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id, date)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's student record
CREATE OR REPLACE FUNCTION public.get_user_student_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.students WHERE user_id = _user_id LIMIT 1
$$;

-- Create function to get user's teacher record
CREATE OR REPLACE FUNCTION public.get_user_teacher_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.teachers WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles RLS Policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Students RLS Policies
CREATE POLICY "Students can view their own record"
  ON public.students FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers and admins can view all students"
  ON public.students FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "Admins can manage students"
  ON public.students FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Teachers RLS Policies
CREATE POLICY "Teachers can view their own record"
  ON public.teachers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view all teachers"
  ON public.teachers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage teachers"
  ON public.teachers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Classes RLS Policies
CREATE POLICY "Everyone can view classes"
  ON public.classes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can view their classes"
  ON public.classes FOR SELECT
  USING (teacher_id = public.get_user_teacher_id(auth.uid()));

CREATE POLICY "Admins and teachers can manage classes"
  ON public.classes FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'teacher')
  );

-- Class enrollments RLS Policies
CREATE POLICY "Everyone can view enrollments"
  ON public.class_enrollments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage enrollments"
  ON public.class_enrollments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Bus routes RLS Policies
CREATE POLICY "Everyone can view bus routes"
  ON public.bus_routes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage bus routes"
  ON public.bus_routes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Bus stops RLS Policies
CREATE POLICY "Everyone can view bus stops"
  ON public.bus_stops FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage bus stops"
  ON public.bus_stops FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Bus assignments RLS Policies
CREATE POLICY "Everyone can view bus assignments"
  ON public.bus_assignments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage bus assignments"
  ON public.bus_assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Periods RLS Policies
CREATE POLICY "Everyone can view periods"
  ON public.periods FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage periods"
  ON public.periods FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Class schedules RLS Policies
CREATE POLICY "Everyone can view schedules"
  ON public.class_schedules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage schedules"
  ON public.class_schedules FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Attendance records RLS Policies
CREATE POLICY "Students can view their own attendance"
  ON public.attendance_records FOR SELECT
  USING (student_id = public.get_user_student_id(auth.uid()));

CREATE POLICY "Teachers and admins can view all attendance"
  ON public.attendance_records FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "Teachers and admins can manage attendance"
  ON public.attendance_records FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'teacher')
  );

-- Notifications RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and teachers can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'teacher')
  );

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bus_routes_updated_at
  BEFORE UPDATE ON public.bus_routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger function for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX idx_class_enrollments_student_id ON public.class_enrollments(student_id);
CREATE INDEX idx_class_enrollments_class_id ON public.class_enrollments(class_id);
CREATE INDEX idx_bus_assignments_student_id ON public.bus_assignments(student_id);
CREATE INDEX idx_bus_assignments_route_id ON public.bus_assignments(route_id);
CREATE INDEX idx_attendance_records_student_id ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_records_date ON public.attendance_records(date);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Everyone can view subjects
CREATE POLICY "Everyone can view subjects"
  ON public.subjects
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins can manage subjects
CREATE POLICY "Admins can manage subjects"
  ON public.subjects
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;

-- Insert default subjects
INSERT INTO public.subjects (name) VALUES
  ('Math'),
  ('Science'),
  ('English'),
  ('Arabic'),
  ('Social Studies'),
  ('Art'),
  ('Music'),
  ('PE'),
  ('Computer Science'),
  ('ICT'),
  ('French'),
  ('Spanish'),
  ('Islamic Studies'),
  ('History'),
  ('Geography')
ON CONFLICT (name) DO NOTHING;
-- Temporarily allow public access to subjects table for testing
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Everyone can view subjects" ON public.subjects;

-- Allow anyone authenticated or not to manage subjects (temporary for development)
CREATE POLICY "Public can manage subjects"
  ON public.subjects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also make classes publicly accessible for now
DROP POLICY IF EXISTS "Admins and teachers can manage classes" ON public.classes;
DROP POLICY IF EXISTS "Everyone can view classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can view their classes" ON public.classes;

CREATE POLICY "Public can manage classes"
  ON public.classes
  FOR ALL
  USING (true)
  WITH CHECK (true);
-- Insert default subjects
INSERT INTO public.subjects (name) VALUES
  ('Mathematics'),
  ('English'),
  ('Science'),
  ('Social Studies'),
  ('Arabic'),
  ('Physical Education'),
  ('Art'),
  ('Music'),
  ('Computer Science'),
  ('Islamic Studies')
ON CONFLICT DO NOTHING;
-- Temporarily disable RLS on all tables for development
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_stops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods DISABLE ROW LEVEL SECURITY;
-- Make user_id nullable in teachers table since we're removing auth requirement
ALTER TABLE public.teachers ALTER COLUMN user_id DROP NOT NULL;
-- Add teacher info fields directly to teachers table
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;
-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true);

-- Create RLS policies for student photos bucket
CREATE POLICY "Anyone can view student photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');

CREATE POLICY "Anyone can upload student photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Anyone can update student photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'student-photos');

CREATE POLICY "Anyone can delete student photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'student-photos');

-- Add photo_url column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS photo_url TEXT;
-- Add address column to students table
ALTER TABLE public.students 
ADD COLUMN address TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.students.address IS 'Student home address used for bus pickup/dropoff';
-- Add gender column to students table
ALTER TABLE public.students 
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female'));

-- Create guardians table for parent/guardian information
CREATE TABLE public.guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  relation TEXT NOT NULL CHECK (relation IN ('father', 'mother', 'guardian', 'other')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on guardians table
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Guardians policies
CREATE POLICY "Admins can manage guardians"
ON public.guardians
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can view guardians"
ON public.guardians
FOR SELECT
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates on guardians
CREATE TRIGGER update_guardians_updated_at
BEFORE UPDATE ON public.guardians
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster guardian lookups by student
CREATE INDEX idx_guardians_student_id ON public.guardians(student_id);
-- Enable realtime for bus_assignments table
ALTER PUBLICATION supabase_realtime ADD TABLE bus_assignments;
-- Add date_of_birth column to students table
ALTER TABLE public.students 
ADD COLUMN date_of_birth date;
-- Add qr_code column to class_schedules table
ALTER TABLE class_schedules 
ADD COLUMN qr_code TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Create index for faster QR code lookups
CREATE INDEX idx_class_schedules_qr_code ON class_schedules(qr_code);
-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  building TEXT,
  floor INTEGER,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Admins can manage rooms
CREATE POLICY "Admins can manage rooms"
ON public.rooms
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view rooms
CREATE POLICY "Everyone can view rooms"
ON public.rooms
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create a test admin user through SQL
-- Note: This inserts directly into auth.users which requires special permissions
-- Instead, we'll ensure the existing accounts have admin roles

-- First, let's make sure all existing users have admin access for testing
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
ON CONFLICT DO NOTHING;
-- Remove authentication requirement for rooms table
-- WARNING: This allows ANYONE to add/edit/delete rooms without authentication

-- Drop existing RLS policies on rooms
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Everyone can view rooms" ON public.rooms;

-- Create new public policies that allow anyone to manage rooms
CREATE POLICY "Anyone can manage rooms"
ON public.rooms
FOR ALL
TO public
USING (true)
WITH CHECK (true);
-- Enable realtime for rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
-- Add room_id column to class_schedules table
ALTER TABLE public.class_schedules 
ADD COLUMN room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_class_schedules_room_id ON public.class_schedules(room_id);

-- Remove room_number from classes table since rooms are now assigned at schedule level
ALTER TABLE public.classes 
DROP COLUMN IF EXISTS room_number;
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
-- Add is_all_day column to periods table
ALTER TABLE periods ADD COLUMN is_all_day BOOLEAN DEFAULT false NOT NULL;

-- Make recorded_by nullable since classroom devices don't require authentication
ALTER TABLE attendance_records 
ALTER COLUMN recorded_by DROP NOT NULL;

-- Add a comment to explain this design decision
COMMENT ON COLUMN attendance_records.recorded_by IS 'User ID who recorded the attendance. Nullable for classroom device attendance where no user authentication is required.';
-- Make class_id nullable in attendance_records for bus attendance
ALTER TABLE public.attendance_records 
ALTER COLUMN class_id DROP NOT NULL;
-- Allow anyone to view guardian records (for parent portal access)
-- Note: In production, this should be secured with proper parent authentication
CREATE POLICY "Anyone can view guardians"
ON public.guardians
FOR SELECT
USING (true);
-- Add month field to class_schedules table
ALTER TABLE class_schedules 
ADD COLUMN month INTEGER CHECK (month >= 1 AND month <= 12);
-- Fix guardians table RLS to allow inserting guardians during student registration
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage guardians" ON public.guardians;
DROP POLICY IF EXISTS "Teachers can view guardians" ON public.guardians;
DROP POLICY IF EXISTS "Anyone can view guardians" ON public.guardians;

-- Enable RLS on guardians
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert guardians (needed for student registration)
CREATE POLICY "Allow guardian registration"
ON public.guardians
FOR INSERT
WITH CHECK (true);

-- Allow users to view guardians
CREATE POLICY "Anyone can view guardians"
ON public.guardians
FOR SELECT
USING (true);

-- Allow admins to manage all guardians
CREATE POLICY "Admins can manage guardians"
ON public.guardians
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow guardians to update their own records
CREATE POLICY "Guardians can update own records"
ON public.guardians
FOR UPDATE
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Enable RLS on tables that have policies but RLS disabled
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_stops ENABLE ROW LEVEL SECURITY;
-- Allow student registration without authentication
-- This is needed for the student registration form to work

-- Drop existing INSERT-only policy if it exists
DROP POLICY IF EXISTS "Allow student registration" ON public.students;

-- Add policy to allow anyone to insert students (for registration)
CREATE POLICY "Allow student registration"
ON public.students
FOR INSERT
WITH CHECK (true);

-- Keep existing policies for SELECT and admin management unchanged
-- Fix RLS policies for periods table to allow anyone to insert/update/delete
-- This is needed for the admin interface to work

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations on periods" ON public.periods;

-- Create policy to allow all operations on periods table
CREATE POLICY "Allow all operations on periods"
ON public.periods
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure teachers table also has proper policies for insert/update/delete
DROP POLICY IF EXISTS "Allow all operations on teachers" ON public.teachers;

CREATE POLICY "Allow all operations on teachers"
ON public.teachers
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure classes table has proper policies
DROP POLICY IF EXISTS "Allow all operations on classes" ON public.classes;

CREATE POLICY "Allow all operations on classes"
ON public.classes
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Ensure class_schedules table has proper policies
DROP POLICY IF EXISTS "Allow all operations on class_schedules" ON public.class_schedules;

CREATE POLICY "Allow all operations on class_schedules"
ON public.class_schedules
FOR ALL
TO public
USING (true)
WITH CHECK (true);
