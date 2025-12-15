-- =====================================================
-- TEST DATA FOR BOARD TEAM TESTING
-- Created: 2025-12-12
-- Purpose: Enable testing of attendance scanning for both
--          classroom and bus scenarios
-- =====================================================

-- 1. Create Test Student
INSERT INTO students (
  id, 
  student_code, 
  full_name, 
  grade, 
  section,
  qr_code,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'TEST001',
  'Test Student',
  'Test Grade',
  'T',
  'STUDENT:TEST001',
  'active'
) ON CONFLICT (student_code) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  grade = EXCLUDED.grade,
  section = EXCLUDED.section,
  qr_code = EXCLUDED.qr_code,
  status = EXCLUDED.status;

-- 2. Create Test Class Attendance (linked to John Anderson - TCH001)
INSERT INTO classes (
  id,
  name,
  grade,
  section,
  subject,
  teacher_id
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Test Class Attendance',
  'Test Grade',
  'T',
  'Test Subject',
  'e4a8235a-82f8-4d6e-ae38-0a26477afad6'  -- John Anderson TCH001
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  grade = EXCLUDED.grade,
  section = EXCLUDED.section,
  subject = EXCLUDED.subject,
  teacher_id = EXCLUDED.teacher_id;

-- 3. Create Test Bus Attendance route
INSERT INTO bus_routes (
  id,
  name,
  route_code,
  driver_name,
  driver_phone,
  departure_time,
  return_time,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Test Bus Attendance',
  'BUS-TEST',
  'Test Driver',
  '+1-555-0199',
  '07:30:00',
  '15:30:00',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  route_code = EXCLUDED.route_code,
  driver_name = EXCLUDED.driver_name,
  driver_phone = EXCLUDED.driver_phone,
  departure_time = EXCLUDED.departure_time,
  return_time = EXCLUDED.return_time,
  status = EXCLUDED.status;

-- 4. Create Test Period (all-day for flexible testing) 
-- Note: Uses ON CONFLICT on period_number, so actual ID may differ
INSERT INTO periods (
  id,
  period_number,
  start_time,
  end_time,
  is_all_day
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  99,
  '00:00:00',
  '23:59:59',
  true
) ON CONFLICT (period_number) DO UPDATE SET
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  is_all_day = EXCLUDED.is_all_day;

-- 5. Enroll Test Student in Test Class
INSERT INTO class_enrollments (
  student_id,
  class_id
) VALUES (
  '00000000-0000-0000-0000-000000000001',  -- Test Student
  '00000000-0000-0000-0000-000000000002'   -- Test Class Attendance
) ON CONFLICT (student_id, class_id) DO NOTHING;

-- 6. Create Test Bus Stop (required for bus assignments)
INSERT INTO bus_stops (
  id,
  route_id,
  name,
  location,
  arrival_time,
  stop_order
) VALUES (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000003',  -- Test Bus Attendance route
  'Test Stop',
  'Test Location Address',
  '07:45:00',
  1
) ON CONFLICT (id) DO UPDATE SET
  route_id = EXCLUDED.route_id,
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  arrival_time = EXCLUDED.arrival_time,
  stop_order = EXCLUDED.stop_order;

-- 7. Assign Test Student to Test Bus Route
INSERT INTO bus_assignments (
  student_id,
  route_id,
  stop_id
) VALUES (
  '00000000-0000-0000-0000-000000000001',  -- Test Student
  '00000000-0000-0000-0000-000000000003',  -- Test Bus Attendance
  '00000000-0000-0000-0000-000000000006'   -- Test Stop
) ON CONFLICT (student_id) DO UPDATE SET
  route_id = EXCLUDED.route_id,
  stop_id = EXCLUDED.stop_id;

-- 8. Create Class Schedule for Test Class
-- Note: period_id must be fetched dynamically as it may differ
INSERT INTO class_schedules (
  id,
  class_id,
  period_id,
  day,
  week_number,
  room_id,
  qr_code
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM periods WHERE period_number = 99),  -- Dynamic period lookup
  'Monday',
  1,
  (SELECT id FROM rooms WHERE name = 'RM001' LIMIT 1),
  'CLASS:TEST001'
) ON CONFLICT (id) DO UPDATE SET
  class_id = EXCLUDED.class_id,
  period_id = EXCLUDED.period_id,
  day = EXCLUDED.day,
  week_number = EXCLUDED.week_number,
  room_id = EXCLUDED.room_id,
  qr_code = EXCLUDED.qr_code;

-- =====================================================
-- TEST INSTRUCTIONS
-- =====================================================
-- 
-- After running this script, you can test:
--
-- 1. CLASSROOM ATTENDANCE:
--    - Go to: /classroom-login/RM001
--    - Enter or scan: TEST001 or STUDENT:TEST001
--    - Should record attendance for "Test Student"
--
-- 2. BUS ATTENDANCE:
--    - Go to: /bus-attendance
--    - Select: "Test Bus Attendance" from the dropdown
--    - Enter or scan: TEST001 or STUDENT:TEST001  
--    - Should record bus attendance for "Test Student"
--
-- 3. BUS MAP (Parent Portal):
--    - Log in as a parent
--    - View bus tracking map (should display with Mapbox)
--
-- =====================================================
