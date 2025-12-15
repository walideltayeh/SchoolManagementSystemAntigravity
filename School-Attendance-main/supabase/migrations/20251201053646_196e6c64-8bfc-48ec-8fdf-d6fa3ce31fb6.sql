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