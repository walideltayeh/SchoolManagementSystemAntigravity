import uuid
import json

# Helper to generate UUID
def gen_uuid():
    return str(uuid.uuid4())

# Data Storage
rooms = []
periods = []
subjects = []
teachers = []
classes = []
bus_routes = []
bus_stops = []
students = []
class_enrollments = []
bus_assignments = []

# 1. Rooms
for i in range(1, 101):
    rooms.append({
        "id": gen_uuid(),
        "name": f"Room {i:02d}",
        "capacity": 30,
        "building": "Main Block",
        "floor": (i - 1) // 20 + 1
    })

# 2. Periods
period_times = [
    ("08:00", "08:45"), ("08:50", "09:35"), ("09:40", "10:25"), ("10:40", "11:25"),
    ("11:30", "12:15"), ("13:00", "13:45"), ("13:50", "14:35"), ("14:40", "15:25")
]
for i, (start, end) in enumerate(period_times, 1):
    periods.append({
        "id": gen_uuid(),
        "period_number": i,
        "start_time": start,
        "end_time": end,
        "is_all_day": False
    })

# 3. Subjects
subject_names = ["Mathematics", "Science", "English", "History", "Computer Science", "Physical Education", "Arts", "Spanish", "Physics", "Biology", "Chemistry", "Literature"]
subject_map = {} # Name -> ID
for name in subject_names:
    uid = gen_uuid()
    subjects.append({"id": uid, "name": name})
    subject_map[name] = uid

# 4. Teachers
teacher_data = [
    {"name": "John Anderson", "email": "j.anderson@school.edu", "subject": "Mathematics", "code": "TCH001"},
    {"name": "Dr. Emily Thompson", "email": "e.thompson@school.edu", "subject": "Science", "code": "TCH002"},
    {"name": "Sarah Mitchell", "email": "s.mitchell@school.edu", "subject": "English", "code": "TCH003"},
    {"name": "Robert Davis", "email": "r.davis@school.edu", "subject": "History", "code": "TCH004"},
    {"name": "Lisa Chen", "email": "l.chen@school.edu", "subject": "Computer Science", "code": "TCH005"},
    {"name": "Michael Brown", "email": "m.brown@school.edu", "subject": "Physical Education", "code": "TCH006"},
    {"name": "Jennifer Garcia", "email": "j.garcia@school.edu", "subject": "Arts", "code": "TCH007"},
    {"name": "Carlos Rodriguez", "email": "c.rodriguez@school.edu", "subject": "Spanish", "code": "TCH008"}
]
teacher_map = {} # Name -> ID
for t in teacher_data:
    uid = gen_uuid()
    teachers.append({
        "id": uid,
        "full_name": t["name"],
        "email": t["email"],
        "teacher_code": t["code"],
        "subjects": [t["subject"]]
    })
    teacher_map[t["name"]] = uid

# 5. Classes
# Helper to find room by name (simplified, just picking rooms sequentially)
room_idx = 0
def get_next_room():
    global room_idx
    r = rooms[room_idx]["id"]
    room_idx = (room_idx + 1) % len(rooms)
    return r

class_definitions = [
    # Grade 9 - Section A
    {"name": "Grade 9 - Section A", "grade": "Grade 9", "section": "A", "subject": "Mathematics", "teacher": "John Anderson"},
    {"name": "Grade 9 - Section A", "grade": "Grade 9", "section": "A", "subject": "Science", "teacher": "Dr. Emily Thompson"},
    {"name": "Grade 9 - Section A", "grade": "Grade 9", "section": "A", "subject": "English", "teacher": "Sarah Mitchell"},
    {"name": "Grade 9 - Section A", "grade": "Grade 9", "section": "A", "subject": "History", "teacher": "Robert Davis"},
    # Grade 9 - Section B
    {"name": "Grade 9 - Section B", "grade": "Grade 9", "section": "B", "subject": "Mathematics", "teacher": "John Anderson"},
    {"name": "Grade 9 - Section B", "grade": "Grade 9", "section": "B", "subject": "Science", "teacher": "Dr. Emily Thompson"},
    {"name": "Grade 9 - Section B", "grade": "Grade 9", "section": "B", "subject": "English", "teacher": "Sarah Mitchell"},
    {"name": "Grade 9 - Section B", "grade": "Grade 9", "section": "B", "subject": "History", "teacher": "Robert Davis"},
    # Grade 10 - Section A
    {"name": "Grade 10 - Section A", "grade": "Grade 10", "section": "A", "subject": "Mathematics", "teacher": "John Anderson"},
    {"name": "Grade 10 - Section A", "grade": "Grade 10", "section": "A", "subject": "Science", "teacher": "Dr. Emily Thompson"},
    {"name": "Grade 10 - Section A", "grade": "Grade 10", "section": "A", "subject": "English", "teacher": "Sarah Mitchell"},
    {"name": "Grade 10 - Section A", "grade": "Grade 10", "section": "A", "subject": "Computer Science", "teacher": "Lisa Chen"},
    # Grade 10 - Section B
    {"name": "Grade 10 - Section B", "grade": "Grade 10", "section": "B", "subject": "Mathematics", "teacher": "John Anderson"},
    {"name": "Grade 10 - Section B", "grade": "Grade 10", "section": "B", "subject": "Science", "teacher": "Dr. Emily Thompson"},
    {"name": "Grade 10 - Section B", "grade": "Grade 10", "section": "B", "subject": "Spanish", "teacher": "Carlos Rodriguez"},
    {"name": "Grade 10 - Section B", "grade": "Grade 10", "section": "B", "subject": "History", "teacher": "Robert Davis"},
    # Grade 11 - Section A
    {"name": "Grade 11 - Section A", "grade": "Grade 11", "section": "A", "subject": "Mathematics", "teacher": "John Anderson"},
    {"name": "Grade 11 - Section A", "grade": "Grade 11", "section": "A", "subject": "Science", "teacher": "Dr. Emily Thompson"},
    {"name": "Grade 11 - Section A", "grade": "Grade 11", "section": "A", "subject": "English", "teacher": "Sarah Mitchell"},
    {"name": "Grade 11 - Section A", "grade": "Grade 11", "section": "A", "subject": "Computer Science", "teacher": "Lisa Chen"},
    # Grade 12 - Section A
    {"name": "Grade 12 - Section A", "grade": "Grade 12", "section": "A", "subject": "Mathematics", "teacher": "John Anderson"},
    {"name": "Grade 12 - Section A", "grade": "Grade 12", "section": "A", "subject": "Science", "teacher": "Dr. Emily Thompson"},
    {"name": "Grade 12 - Section A", "grade": "Grade 12", "section": "A", "subject": "English", "teacher": "Sarah Mitchell"},
    {"name": "Grade 12 - Section A", "grade": "Grade 12", "section": "A", "subject": "Arts", "teacher": "Jennifer Garcia"},
]

class_map = {} # (Grade, Section) -> [Class IDs]
for c in class_definitions:
    uid = gen_uuid()
    classes.append({
        "id": uid,
        "name": c["name"],
        "grade": c["grade"],
        "section": c["section"],
        "subject": c["subject"],
        "teacher_id": teacher_map[c["teacher"]]
    })
    key = (c["grade"], c["section"])
    if key not in class_map:
        class_map[key] = []
    class_map[key].append(uid)

# 6. Bus Routes
bus_route_data = [
    {"name": "North Route", "code": "BUS001", "driver": "John Smith", "phone": "555-0201", "dep": "07:00", "ret": "15:30"},
    {"name": "South Route", "code": "BUS002", "driver": "Maria Johnson", "phone": "555-0202", "dep": "07:15", "ret": "15:45"},
    {"name": "East Route", "code": "BUS003", "driver": "Robert Williams", "phone": "555-0203", "dep": "07:10", "ret": "15:40"}
]
bus_route_map = {} # Name -> ID
for b in bus_route_data:
    uid = gen_uuid()
    bus_routes.append({
        "id": uid,
        "name": b["name"],
        "route_code": b["code"],
        "driver_name": b["driver"],
        "driver_phone": b["phone"],
        "departure_time": b["dep"],
        "return_time": b["ret"],
        "status": "active"
    })
    bus_route_map[b["name"]] = uid

# 7. Bus Stops
bus_stop_data = [
    # North
    {"name": "Maple Street Stop", "route": "North Route", "time": "07:05", "loc": "North District", "order": 1},
    {"name": "Oak Avenue Stop", "route": "North Route", "time": "07:15", "loc": "North District", "order": 2},
    {"name": "Pine Road Stop", "route": "North Route", "time": "07:25", "loc": "North District", "order": 3},
    {"name": "Cedar Lane Stop", "route": "North Route", "time": "07:35", "loc": "North District", "order": 4},
    # South
    {"name": "Downtown Plaza", "route": "South Route", "time": "07:20", "loc": "South District", "order": 1},
    {"name": "Market Street", "route": "South Route", "time": "07:30", "loc": "South District", "order": 2},
    {"name": "River Road", "route": "South Route", "time": "07:40", "loc": "South District", "order": 3},
    # East
    {"name": "Hill Street", "route": "East Route", "time": "07:15", "loc": "East District", "order": 1},
    {"name": "Valley Drive", "route": "East Route", "time": "07:25", "loc": "East District", "order": 2},
    {"name": "Mountain View", "route": "East Route", "time": "07:35", "loc": "East District", "order": 3},
]
bus_stop_map = {} # Name -> ID
for s in bus_stop_data:
    uid = gen_uuid()
    bus_stops.append({
        "id": uid,
        "name": s["name"],
        "route_id": bus_route_map[s["route"]],
        "arrival_time": s["time"],
        "location": s["loc"],
        "stop_order": s["order"]
    })
    bus_stop_map[s["name"]] = uid

# 8. Students
student_data = [
    # Grade 9 - Section A
    {"name": "Emma Williams", "grade": "Grade 9", "section": "A", "blood": "O+", "allergy": False, "bus": "North Route", "stop": "Maple Street Stop"},
    {"name": "Liam Johnson", "grade": "Grade 9", "section": "A", "blood": "A+", "allergy": True, "bus": None},
    {"name": "Olivia Brown", "grade": "Grade 9", "section": "A", "blood": "B+", "allergy": False, "bus": "South Route", "stop": "Downtown Plaza"},
    {"name": "Noah Davis", "grade": "Grade 9", "section": "A", "blood": "AB+", "allergy": False, "bus": None},
    {"name": "Ava Martinez", "grade": "Grade 9", "section": "A", "blood": "O-", "allergy": True, "bus": "North Route", "stop": "Oak Avenue Stop"},
    {"name": "Ethan Garcia", "grade": "Grade 9", "section": "A", "blood": "A-", "allergy": False, "bus": None},
    {"name": "Sophia Rodriguez", "grade": "Grade 9", "section": "A", "blood": "B-", "allergy": False, "bus": "East Route", "stop": "Hill Street"},
    {"name": "Mason Wilson", "grade": "Grade 9", "section": "A", "blood": "O+", "allergy": False, "bus": None},
    # Grade 9 - Section B
    {"name": "Isabella Anderson", "grade": "Grade 9", "section": "B", "blood": "A+", "allergy": False, "bus": "South Route", "stop": "Market Street"},
    {"name": "William Taylor", "grade": "Grade 9", "section": "B", "blood": "O+", "allergy": False, "bus": None},
    {"name": "Mia Thomas", "grade": "Grade 9", "section": "B", "blood": "B+", "allergy": False, "bus": "North Route", "stop": "Pine Road Stop"},
    {"name": "James Moore", "grade": "Grade 9", "section": "B", "blood": "AB+", "allergy": True, "bus": None},
    {"name": "Charlotte Jackson", "grade": "Grade 9", "section": "B", "blood": "O-", "allergy": False, "bus": "East Route", "stop": "Valley Drive"},
    {"name": "Benjamin White", "grade": "Grade 9", "section": "B", "blood": "A-", "allergy": False, "bus": None},
    # Grade 10 - Section A
    {"name": "Amelia Harris", "grade": "Grade 10", "section": "A", "blood": "B-", "allergy": False, "bus": "South Route", "stop": "River Road"},
    {"name": "Lucas Martin", "grade": "Grade 10", "section": "A", "blood": "O+", "allergy": False, "bus": None},
    {"name": "Harper Thompson", "grade": "Grade 10", "section": "A", "blood": "A+", "allergy": True, "bus": "North Route", "stop": "Cedar Lane Stop"},
    {"name": "Alexander Lee", "grade": "Grade 10", "section": "A", "blood": "B+", "allergy": False, "bus": None},
    {"name": "Evelyn Walker", "grade": "Grade 10", "section": "A", "blood": "AB+", "allergy": False, "bus": None},
    {"name": "Daniel Hall", "grade": "Grade 10", "section": "A", "blood": "O-", "allergy": False, "bus": "East Route", "stop": "Mountain View"},
    # Grade 10 - Section B
    {"name": "Abigail Allen", "grade": "Grade 10", "section": "B", "blood": "A-", "allergy": False, "bus": None},
    {"name": "Matthew Young", "grade": "Grade 10", "section": "B", "blood": "B-", "allergy": False, "bus": "South Route", "stop": "Downtown Plaza"},
    {"name": "Emily King", "grade": "Grade 10", "section": "B", "blood": "O+", "allergy": False, "bus": None},
    {"name": "Joseph Wright", "grade": "Grade 10", "section": "B", "blood": "A+", "allergy": True, "bus": "North Route", "stop": "Maple Street Stop"},
    {"name": "Elizabeth Scott", "grade": "Grade 10", "section": "B", "blood": "B+", "allergy": False, "bus": None},
    # Grade 11 - Section A
    {"name": "David Green", "grade": "Grade 11", "section": "A", "blood": "AB+", "allergy": False, "bus": "East Route", "stop": "Hill Street"},
    {"name": "Sofia Adams", "grade": "Grade 11", "section": "A", "blood": "O-", "allergy": False, "bus": None},
    {"name": "Jackson Baker", "grade": "Grade 11", "section": "A", "blood": "A-", "allergy": False, "bus": "South Route", "stop": "Market Street"},
    {"name": "Avery Nelson", "grade": "Grade 11", "section": "A", "blood": "B-", "allergy": True, "bus": None},
    {"name": "Samuel Carter", "grade": "Grade 11", "section": "A", "blood": "O+", "allergy": False, "bus": "North Route", "stop": "Oak Avenue Stop"},
    # Grade 12 - Section A
    {"name": "Grace Mitchell", "grade": "Grade 12", "section": "A", "blood": "A+", "allergy": False, "bus": None},
    {"name": "Henry Perez", "grade": "Grade 12", "section": "A", "blood": "B+", "allergy": False, "bus": "East Route", "stop": "Valley Drive"},
    {"name": "Chloe Roberts", "grade": "Grade 12", "section": "A", "blood": "AB+", "allergy": False, "bus": None},
    {"name": "Sebastian Turner", "grade": "Grade 12", "section": "A", "blood": "O-", "allergy": True, "bus": "South Route", "stop": "River Road"},
    {"name": "Victoria Phillips", "grade": "Grade 12", "section": "A", "blood": "A-", "allergy": False, "bus": None}
]

for i, s in enumerate(student_data, 1):
    uid = gen_uuid()
    students.append({
        "id": uid,
        "full_name": s["name"],
        "student_code": f"STU{i:03d}",
        "grade": s["grade"],
        "section": s["section"],
        "blood_type": s["blood"],
        "allergies": s["allergy"],
        "status": "active"
    })
    
    # Enroll in classes
    key = (s["grade"], s["section"])
    if key in class_map:
        for class_id in class_map[key]:
            class_enrollments.append({
                "id": gen_uuid(),
                "class_id": class_id,
                "student_id": uid,
                "enrolled_at": "2024-01-01"
            })
            
    # Bus Assignment
    if s["bus"]:
        bus_assignments.append({
            "id": gen_uuid(),
            "route_id": bus_route_map[s["bus"]],
            "stop_id": bus_stop_map[s["stop"]],
            "student_id": uid,
            "assigned_at": "2024-01-01",
            "status": "active"
        })

# Generate SQL
sql = []

# Deletes
sql.append("DELETE FROM attendance_records;")
sql.append("DELETE FROM bus_assignments;")
sql.append("DELETE FROM class_enrollments;")
sql.append("DELETE FROM class_schedules;")
sql.append("DELETE FROM bus_stops;")
sql.append("DELETE FROM bus_routes;")
sql.append("DELETE FROM classes;")
sql.append("DELETE FROM students;")
sql.append("DELETE FROM teachers;")
sql.append("DELETE FROM periods;")
sql.append("DELETE FROM rooms;")
sql.append("DELETE FROM subjects;")

# Inserts
def escape(s):
    if isinstance(s, bool):
        return 'true' if s else 'false'
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

# Rooms
for r in rooms:
    sql.append(f"INSERT INTO rooms (id, name, capacity, building, floor) VALUES ({escape(r['id'])}, {escape(r['name'])}, {r['capacity']}, {escape(r['building'])}, {r['floor']});")

# Periods
for p in periods:
    sql.append(f"INSERT INTO periods (id, period_number, start_time, end_time, is_all_day) VALUES ({escape(p['id'])}, {p['period_number']}, {escape(p['start_time'])}, {escape(p['end_time'])}, {escape(p['is_all_day'])});")

# Subjects
for s in subjects:
    sql.append(f"INSERT INTO subjects (id, name) VALUES ({escape(s['id'])}, {escape(s['name'])});")

# Teachers
for t in teachers:
    sql.append(f"INSERT INTO teachers (id, full_name, email, teacher_code, subjects) VALUES ({escape(t['id'])}, {escape(t['full_name'])}, {escape(t['email'])}, {escape(t['teacher_code'])}, ARRAY[{', '.join([escape(sub) for sub in t['subjects']])}]);")

# Classes
for c in classes:
    sql.append(f"INSERT INTO classes (id, name, grade, section, subject, teacher_id) VALUES ({escape(c['id'])}, {escape(c['name'])}, {escape(c['grade'])}, {escape(c['section'])}, {escape(c['subject'])}, {escape(c['teacher_id'])});")

# Bus Routes
for b in bus_routes:
    sql.append(f"INSERT INTO bus_routes (id, name, route_code, driver_name, driver_phone, departure_time, return_time, status) VALUES ({escape(b['id'])}, {escape(b['name'])}, {escape(b['route_code'])}, {escape(b['driver_name'])}, {escape(b['driver_phone'])}, {escape(b['departure_time'])}, {escape(b['return_time'])}, {escape(b['status'])});")

# Bus Stops
for s in bus_stops:
    sql.append(f"INSERT INTO bus_stops (id, name, route_id, arrival_time, location, stop_order) VALUES ({escape(s['id'])}, {escape(s['name'])}, {escape(s['route_id'])}, {escape(s['arrival_time'])}, {escape(s['location'])}, {s['stop_order']});")

# Students
for s in students:
    sql.append(f"INSERT INTO students (id, full_name, student_code, grade, section, blood_type, allergies, status) VALUES ({escape(s['id'])}, {escape(s['full_name'])}, {escape(s['student_code'])}, {escape(s['grade'])}, {escape(s['section'])}, {escape(s['blood_type'])}, {escape(s['allergies'])}, {escape(s['status'])});")

# Class Enrollments
for e in class_enrollments:
    sql.append(f"INSERT INTO class_enrollments (id, class_id, student_id, enrolled_at) VALUES ({escape(e['id'])}, {escape(e['class_id'])}, {escape(e['student_id'])}, {escape(e['enrolled_at'])});")

# Bus Assignments
for a in bus_assignments:
    sql.append(f"INSERT INTO bus_assignments (id, route_id, stop_id, student_id, assigned_at, status) VALUES ({escape(a['id'])}, {escape(a['route_id'])}, {escape(a['stop_id'])}, {escape(a['student_id'])}, {escape(a['assigned_at'])}, {escape(a['status'])});")

# Write to file
with open("seed.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql))

print("SQL generated in seed.sql")
