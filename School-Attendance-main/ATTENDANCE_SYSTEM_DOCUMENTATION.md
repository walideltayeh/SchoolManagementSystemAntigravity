# School Attendance Management System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Initial System Setup](#initial-system-setup)
3. [Daily Operations Flow](#daily-operations-flow)
4. [User Roles & Responsibilities](#user-roles--responsibilities)
5. [QR Code System](#qr-code-system)
6. [Attendance Workflows](#attendance-workflows)
7. [End of Day Procedures](#end-of-day-procedures)
8. [Technical Architecture](#technical-architecture)

---

## System Overview

### What is the School Attendance Management System?

The School Attendance Management System is a comprehensive digital solution for tracking student attendance using QR code technology. The system eliminates manual paper-based attendance tracking by leveraging QR codes, real-time scanning, and automated validation.

### Key Features
- **QR Code-Based Attendance**: Every student, teacher, bus, and class schedule has a unique QR code
- **Real-Time Validation**: Instant verification of enrollment, schedules, and assignments
- **Multi-Channel Tracking**: Supports both classroom and bus attendance
- **Automated Record Keeping**: All attendance data is automatically stored and timestamped
- **Role-Based Access**: Different interfaces for admins, teachers, and students
- **Camera & Manual Scanning**: Flexible scanning options for various devices

### System Components
1. **Admin Dashboard**: Complete system configuration and management
2. **Teacher Interface**: Classroom device for attendance scanning
3. **Student Portal**: Personal QR code access for students
4. **Bus Attendance Module**: Dedicated bus boarding tracking
5. **Reports & Analytics**: Comprehensive attendance insights

---

## Initial System Setup

### Phase 1: Authentication & User Setup

#### Step 1: Admin Login
- Navigate to `/auth`
- Enter admin credentials
- System validates using Supabase authentication
- Redirected to admin dashboard upon success

#### Step 2: Create Admin Account (First Time)
If no admin exists:
- Sign up with email and password
- System creates user profile
- Assigns 'admin' role in user_roles table
- Enables full system access

### Phase 2: School Infrastructure Setup

#### Step 3: Setup Rooms (MUST BE FIRST)
**Location**: Admin Dashboard → Rooms Tab

**Why First?** Rooms are the foundation - all other components reference rooms.

**Process**:
1. Click "Add New Room"
2. Enter room details:
   - **Name**: (e.g., "Room 101", "Science Lab A")
   - **Building**: (e.g., "Main Building", "North Wing")
   - **Floor**: (e.g., 1, 2, 3)
   - **Capacity**: Maximum number of students (e.g., 30, 40)
3. Click "Add Room"
4. System creates room with unique ID
5. Repeat for all classrooms, labs, and special rooms

**Bulk Import Option**:
- Download CSV template
- Fill with room data: name, building, floor, capacity
- Upload CSV file
- System validates and creates all rooms

**Result**: 
- Rooms database populated
- Each room has unique identifier
- Ready for assignment to classes

#### Step 4: Setup Class Periods
**Location**: Admin Dashboard → Periods Tab

**Purpose**: Define the daily schedule structure

**Process**:
1. Click "Add Period"
2. For each period, enter:
   - **Period Number**: 1, 2, 3, etc.
   - **Start Time**: (e.g., 08:00)
   - **End Time**: (e.g., 08:45)
3. Typical school day example:
   - Period 1: 08:00 - 08:45
   - Period 2: 08:50 - 09:35
   - Break: 09:35 - 10:00
   - Period 3: 10:00 - 10:45
   - Period 4: 10:50 - 11:35
   - Lunch: 11:35 - 12:15
   - Period 5: 12:15 - 13:00
   - Period 6: 13:05 - 13:50

**Result**:
- Complete daily schedule framework
- Time slots for all classes
- Used for attendance timing validation

#### Step 5: Setup Subjects
**Location**: Admin Dashboard → Manage Classes Tab → Subject Management

**Process**:
1. Click "Add Subject"
2. Enter subject name (e.g., "Mathematics", "English", "Science")
3. Click "Add"
4. Repeat for all subjects taught in school

**Common Subjects**:
- Core: Mathematics, English, Science, Social Studies
- Languages: Arabic, French, Spanish
- Arts: Art, Music, Drama
- Physical Education
- Computer Science

**Result**:
- Subject catalog available
- Ready for class creation

#### Step 6: Create Classes
**Location**: Admin Dashboard → Manage Classes Tab

**Process**:
1. Click "Add New Class"
2. Select:
   - **Grade**: 1-12
   - **Section**: A, B, C, D, E, F
   - **Subjects**: Multiple selection (all subjects for this grade/section)
   - **Teacher**: (Optional) Assign class teacher
3. Click "Add Class"
4. System automatically generates:
   - Class name (e.g., "Grade 10-A")
   - Unique class ID
   - Ready for enrollment and scheduling

**Bulk Import Option**:
- Download CSV template
- Fill: grade, section, subject, room_number (optional)
- Upload CSV
- System creates all class combinations

**Example Setup**:
- Grade 10, Section A:
  - Mathematics (assigned to Room 101)
  - English (assigned to Room 102)
  - Science (assigned to Science Lab A)
  - History (assigned to Room 103)

**Result**:
- Complete class structure
- Ready for teacher assignment
- Ready for student enrollment
- Ready for schedule creation

#### Step 7: Add Teachers
**Location**: Admin Dashboard → Manage Teachers Tab

**Process**:
1. Click "Add New Teacher"
2. Enter teacher information:
   - **Full Name**: First and last name
   - **Email**: Official school email
   - **Phone**: Contact number
   - **Username**: Login username
   - **Password**: Initial password (teacher can change later)
   - **Class Assignments**: Select classes this teacher teaches
     - Grade, Section, Subject combinations
3. Click "Add Teacher"
4. System automatically:
   - Creates user account in auth.users
   - Generates unique teacher ID
   - Creates teacher QR code (format: `TEACHER:uuid`)
   - Assigns 'teacher' role in user_roles table
   - Links teacher to selected classes

**Teacher QR Code**:
- Unique identifier for each teacher
- Can be printed for ID cards
- Used for future features (teacher check-in, class validation)

**Result**:
- Teacher account created
- Can log in with username/password
- Assigned to specific classes
- Ready to take attendance

### Phase 3: Student Registration

#### Step 8: Register Students
**Location**: Admin Dashboard or Students → Register

**Process**:
1. Navigate to student registration form
2. Enter student details:
   - **Full Name**: Complete legal name
   - **Student Code**: Unique identifier (e.g., STU2024001)
   - **Date of Birth**: For age verification
   - **Grade**: Current grade level (1-12)
   - **Section**: Class section (A-F)
   - **Gender**: Male/Female
   - **Blood Type**: (Optional) A+, A-, B+, B-, O+, O-, AB+, AB-
   - **Address**: Home address
   - **Photo**: Upload student photo
3. **Guardian Information** (multiple guardians possible):
   - Full Name
   - Relation (Father, Mother, Guardian)
   - Phone Number
   - Email
   - Mark if primary guardian
4. **Medical Information**:
   - Allergies checkbox
   - Allergy details (if applicable)
5. Click "Register Student"

**System Actions**:
1. Validates all required fields
2. Uploads photo to Supabase Storage
3. Creates student record in database
4. **Generates unique student QR code** (format: `STUDENT:uuid`)
5. Marks student as 'active' status
6. Creates guardian records linked to student
7. Assigns student to selected grade/section

**Student QR Code**:
- **Format**: `STUDENT:` followed by unique UUID
- **Purpose**: Primary attendance identifier
- **Storage**: Stored in students table
- **Uniqueness**: Guaranteed unique per student
- **Permanence**: Remains same throughout student's school career

**Result**:
- Student enrolled in system
- QR code generated and ready
- Guardians linked for notifications
- Ready for class enrollment

#### Step 9: Enroll Students in Classes
**Automatic Process** (when student is registered with grade/section):
- System finds all classes for that grade/section
- Automatically creates enrollment records
- Links student to all relevant subject classes

**Manual Process** (if needed):
- Admin can manually adjust enrollments
- Add/remove student from specific classes
- System maintains class_enrollments table

**Result**:
- Student enrolled in all grade/section classes
- Attendance can be taken for these classes
- Enrollment validated during attendance scanning

### Phase 4: Transportation Setup (If Applicable)

#### Step 10: Create Bus Routes
**Location**: Admin Dashboard → Bus Routes Tab

**Process**:
1. Click "Add Bus Route"
2. Enter route details:
   - **Route Name**: (e.g., "Route North", "Downtown Route")
   - **Route Code**: Short identifier (e.g., "BUS-N1", "BUS-DT2")
   - **Driver Name**: Assigned driver's name
   - **Driver Phone**: Contact number
   - **Departure Time**: Morning pickup start time
   - **Return Time**: Afternoon drop-off time
   - **Capacity**: Maximum students on bus
3. Click "Add Route"
4. System generates:
   - Unique route ID
   - **Bus QR code** (format: `BUS:uuid`)
   - Active status

**Bus QR Code**:
- Displayed in bus for student scanning
- Used for boarding verification
- Permanent for that bus route

#### Step 11: Add Bus Stops
**Location**: Admin Dashboard → Bus Routes Tab

**Process**:
1. Select a bus route
2. Click "Add Stop"
3. Enter stop details:
   - **Stop Name**: (e.g., "Main Street", "Park Avenue")
   - **Location**: Detailed address
   - **Stop Order**: Sequence number (1, 2, 3...)
   - **Arrival Time**: Scheduled arrival time
4. Click "Add Stop"
5. Repeat for all stops on route

**Result**:
- Complete route with all stops
- Ordered sequence for driver
- Times for schedule adherence

#### Step 12: Assign Students to Bus Routes
**Location**: Admin Dashboard → Bus Routes Tab or Student Profile

**Process**:
1. Select student
2. Select bus route
3. Select assigned bus stop
4. Click "Assign"
5. System creates bus_assignments record

**Result**:
- Student linked to specific bus and stop
- Validated during bus attendance scanning
- Guardian receives bus assignment info

### Phase 5: Class Scheduling

#### Step 13: Create Class Schedules
**Location**: Admin Dashboard → Calendar Tab

**Purpose**: Assign specific classes to rooms and time slots

**Process**:
1. Click "Add Schedule Entry"
2. Select scheduling details:
   - **Teacher**: Who teaches this period
   - **Class**: Which class (e.g., Grade 10-A Mathematics)
   - **Room**: Which classroom
   - **Day**: Monday, Tuesday, Wednesday, Thursday, Friday
   - **Period**: Which time slot (Period 1-6)
   - **Week Number**: For A/B week rotations (1-4)
3. Click "Add Schedule"

**System Features**:
- **Automatic Room Suggestions**: 
  - Checks class enrollment size
  - Suggests rooms with adequate capacity
  - Shows available rooms (no conflicts)
- **Conflict Detection**:
  - Prevents double-booking rooms
  - Validates teacher availability
  - Checks for scheduling conflicts
- **QR Code Generation**:
  - Each schedule entry gets unique QR code
  - Format: `SCHEDULE:uuid`
  - Used for class-specific attendance

**Example Weekly Schedule**:
```
Monday:
- Period 1 (08:00-08:45): Grade 10-A Math | Room 101 | Teacher: Mr. Smith
- Period 2 (08:50-09:35): Grade 10-A English | Room 102 | Teacher: Ms. Johnson
- Period 3 (10:00-10:45): Grade 10-A Science | Lab A | Teacher: Dr. Brown

Tuesday:
- Period 1 (08:00-08:45): Grade 10-A History | Room 103 | Teacher: Mr. Davis
...
```

**Result**:
- Complete weekly schedule
- All classes have assigned rooms and times
- Teachers know their schedule
- QR codes ready for attendance scanning

#### Step 14: Generate and Print QR Codes
**Location**: Admin Dashboard → QR Codes Tab

**Purpose**: Create physical QR codes for distribution

**Options**:

**A. Bulk Student QR Codes**:
1. Select filters:
   - All grades or specific grade
   - All sections or specific section
2. Click "Print All"
3. System generates printable page with:
   - Student name
   - Student code
   - Grade and section
   - QR code (200x200px, high quality)
   - "Scan for Attendance" label
4. Print on card stock for ID cards
5. Laminate and distribute to students

**B. Class Schedule QR Codes**:
1. View all schedule entries
2. Each shows:
   - Class name
   - Period and day
   - Room assignment
   - Teacher name
   - Week number
   - QR code
3. Print individual QR codes for:
   - Classroom door posting
   - Teacher reference
   - Digital display screens

**C. Bus Route QR Codes**:
1. Each bus route has QR code
2. Print and post inside bus
3. Students scan upon boarding

**Distribution**:
- **Student QR Codes**: Attach to student ID cards
- **Schedule QR Codes**: Post in classrooms
- **Bus QR Codes**: Mount inside bus near entrance
- **Teacher QR Codes**: Teacher ID badges

**Result**:
- Physical QR codes distributed
- System ready for attendance scanning
- All stakeholders have necessary materials

---

## Daily Operations Flow

### Morning Routine

#### 6:00 AM - 7:30 AM: Bus Attendance

**Bus Driver/Attendant Process**:
1. **Setup**:
   - Navigate to `/bus-attendance`
   - Select today's bus route from dropdown
   - System displays:
     - Route name and code
     - Driver information
     - Departure time
     - Bus QR code for students

2. **Student Boarding**:
   - Click "Start Scanning Student QR Codes"
   - Camera activates for QR scanning
   - For each student boarding:
     - Student shows their ID card with QR code
     - Scan QR code using device camera
     - **OR** manually enter QR code if needed

3. **System Validation**:
   - Reads QR code: `STUDENT:abc123...`
   - Looks up student in database
   - Checks if student is assigned to this bus route
   - **If Valid**:
     - Records attendance in attendance_records table
     - Type: 'bus'
     - Status: 'present'
     - Bus route ID linked
     - Timestamp recorded
     - Shows success: "✓ [Student Name] - Boarded"
     - Displays in recent scans list
   - **If Invalid**:
     - Shows error: "❌ Not assigned to this bus"
     - Does not record attendance
     - Displays in recent scans as failed

4. **During Route**:
   - Continue scanning at each stop
   - Recent scans list shows all students
   - Green checkmarks for successful scans
   - Red X for any issues

5. **Arrival at School**:
   - Click "Stop Scanning"
   - System maintains complete record
   - All timestamps preserved
   - Ready for any queries

**Result**:
- All bus riders attendance recorded
- Guardians can verify boarding time
- School has arrival record

#### 7:30 AM - 8:00 AM: Teacher Preparation

**Teacher Process**:
1. **Access Classroom Device**:
   - Each classroom has dedicated tablet/device
   - Navigate to `/classroom-login?roomId=xyz&teacherId=abc`
   - Device URL is specific to that room
   - Automatically loads when device starts

2. **View Today's Schedule**:
   - System shows teacher's schedule for today
   - Displays all periods with:
     - Period number and time
     - Class name and subject
     - Room name
     - Grade and section
     - Week number
   - Automatically filtered to current day
   - Sorted by period number

3. **Wait for First Period**:
   - Teacher reviews schedule
   - Prepares lesson materials
   - Device remains logged in

#### 8:00 AM: First Period - Attendance Process

**Step-by-Step Classroom Attendance**:

1. **Period Selection**:
   - Teacher clicks on Period 1 card
   - System highlights selected period
   - Shows:
     - "Grade 10-A | Mathematics"
     - "08:00 - 08:45"
     - "Room 101"
   - Badge appears: "Selected"

2. **Start Attendance**:
   - Teacher clicks "Start Attendance for Period 1"
   - QR scanner interface opens
   - Options displayed:
     - **Camera Scanner** (default, recommended)
     - **Manual Entry** (backup option)

3. **Scanning Students**:

   **Using Camera Scanner**:
   - Camera activates automatically
   - Teacher holds device steady
   - Students line up at door/front
   - Each student presents ID card with QR code
   - Camera reads QR code: `STUDENT:def456...`
   
   **System Validation Process**:
   ```
   Step 1: Read QR Code
   - Extract student ID from QR code
   
   Step 2: Validate Student
   - Check if student exists and is active
   - If not found: "Invalid student QR code" ❌
   
   Step 3: Get Schedule Details  
   - Retrieve class information
   - Get current period details
   - Verify class teacher
   
   Step 4: Check Enrollment
   - Verify student is enrolled in this class
   - If not enrolled: "Student not enrolled in this class" ❌
   
   Step 5: Record Attendance
   - Create attendance_records entry:
     - student_id: Student UUID
     - class_id: Class UUID  
     - schedule_id: Schedule entry UUID
     - recorded_by: Teacher UUID
     - status: 'present'
     - type: 'classroom'
     - date: Today's date
     - scanned_at: Current timestamp
   ```

   **Real-Time Feedback**:
   - **Success**: 
     - Toast notification: "✓ [Student Name] marked present"
     - Added to Recent Scans list
     - Green background
     - Checkmark icon
     - Student name displayed
     - Timestamp shown
   - **Failure**:
     - Toast notification: "❌ Validation Failed: [reason]"
     - Added to Recent Scans list
     - Red background
     - X icon
     - Error message displayed
     - Timestamp shown

4. **Recent Scans Display**:
   - Shows last 10 scans
   - Each entry shows:
     - Success/failure icon
     - Student name
     - Status message
     - Time of scan
   - Updates in real-time
   - Scrollable list

5. **Complete Attendance**:
   - Continue scanning until all present students scanned
   - Review recent scans for any errors
   - Click "Stop Scanning"
   - Scanner closes
   - Attendance for period complete

6. **Manual Entry Fallback**:
   - If camera fails or QR code damaged:
   - Switch to "Manual Entry" mode
   - Type or paste QR code string
   - Format: `STUDENT:uuid-string`
   - Click "Submit Attendance"
   - Same validation process runs
   - Student marked present

**Between Periods** (08:45 - 08:50):
- Teacher closes scanner
- Students move to next class
- System maintains all records
- Data synced to database

### Rest of School Day

#### Period 2-6 Attendance (08:50 - 13:50)

**Process Repeats for Each Period**:
1. Teacher selects next period from schedule
2. Clicks "Start Attendance"
3. Scans students as they enter
4. System validates each student
5. Records attendance with correct period/class
6. Displays recent scans
7. Stops scanning at period end

**Automatic Context Awareness**:
- System knows which period based on selection
- Validates students for THAT specific class
- Links to correct schedule entry
- Separates attendance by period
- Each period independent

**Special Cases**:

**Late Student Arrival**:
- Teacher can scan student mid-period
- System records attendance with late timestamp
- Status still 'present'
- Timestamp shows exact arrival time
- Can be marked 'late' manually if needed

**Student Leaving Early**:
- Not automatically tracked
- Teacher can manually note
- Future feature: checkout scanning

**Absent Students**:
- Not scanned = absent
- System infers absence by missing scan
- No action needed from teacher
- Absence automatically calculated

**Make-up Attendance**:
- If student missed scanning
- Teacher can manually enter later
- Or rescan student at end of period
- System accepts with note

### End of School Day

#### 13:50 - 14:30: Afternoon Bus Attendance

**Same Process as Morning**:
1. Bus attendant opens `/bus-attendance`
2. Selects afternoon return route
3. Starts scanning students
4. Students scan upon boarding
5. System validates bus assignment
6. Records afternoon bus attendance
7. Separate records for AM/PM routes

---

## User Roles & Responsibilities

### Administrator Role

**Access**: Full system access
**Primary Interface**: Admin Dashboard (`/admin`)

**Responsibilities**:
1. **System Configuration**:
   - Create and manage rooms
   - Setup class periods
   - Define subjects
   - Configure school structure

2. **User Management**:
   - Register students
   - Add teachers
   - Assign roles
   - Manage user accounts

3. **Class Management**:
   - Create classes
   - Assign teachers
   - Enroll students
   - Manage class structures

4. **Schedule Management**:
   - Create class schedules
   - Assign rooms to periods
   - Resolve conflicts
   - Manage room occupancy

5. **Transportation**:
   - Setup bus routes
   - Add bus stops
   - Assign students to buses
   - Manage transportation

6. **QR Code Management**:
   - Generate bulk QR codes
   - Print student ID codes
   - Manage schedule QR codes
   - Distribute materials

7. **Reporting**:
   - View attendance reports
   - Analyze patterns
   - Export data
   - Monitor system usage

8. **Data Maintenance**:
   - Clean up old data
   - Archive records
   - Backup system
   - Maintain data integrity

### Teacher Role

**Access**: Classroom device, teacher schedule
**Primary Interface**: Classroom Login (`/classroom-login`)

**Responsibilities**:
1. **Daily Attendance**:
   - Log into classroom device
   - View daily schedule
   - Select appropriate period
   - Scan student QR codes
   - Verify attendance records

2. **Classroom Management**:
   - Manage period transitions
   - Handle late arrivals
   - Note absences
   - Report issues

3. **Device Management**:
   - Keep classroom device charged
   - Report technical issues
   - Maintain device security
   - Log out at day end

### Student Role

**Access**: Student portal
**Primary Interface**: Student Portal (`/student-portal`)

**Responsibilities**:
1. **QR Code Access**:
   - Log into student portal
   - Access personal QR code
   - Keep ID card accessible
   - Present for scanning

2. **Attendance Compliance**:
   - Arrive on time
   - Present ID for classroom scanning
   - Scan bus QR for transportation
   - Report lost/damaged ID

3. **Portal Usage**:
   - Download QR code if needed
   - Print for backup
   - Keep login credentials secure

### Bus Driver/Attendant Role

**Access**: Bus attendance module
**Primary Interface**: Bus Attendance (`/bus-attendance`)

**Responsibilities**:
1. **Route Management**:
   - Select correct route
   - Follow scheduled stops
   - Maintain timing

2. **Attendance Recording**:
   - Scan students boarding
   - Verify bus assignments
   - Report discrepancies
   - Complete route scans

3. **Device Management**:
   - Keep scanning device charged
   - Report technical issues
   - Maintain scan records

---

## QR Code System

### QR Code Architecture

**Format Structure**:
All QR codes follow format: `TYPE:UUID`

**Types**:
1. **STUDENT**: `STUDENT:abc123-def456-ghi789...`
   - Unique per student
   - Never changes
   - Primary attendance identifier
   
2. **TEACHER**: `TEACHER:xyz789-abc123-def456...`
   - Unique per teacher
   - For future features
   - Teacher identification

3. **SCHEDULE**: `SCHEDULE:mno345-pqr678-stu901...`
   - Unique per schedule entry
   - Links to specific class/period/room/day
   - Used for class-specific attendance

4. **BUS**: `BUS:uvw234-xyz567-abc890...`
   - Unique per bus route
   - Permanent for route
   - For student boarding verification

### QR Code Generation

**Automatic Generation**:
- Generated by database on record creation
- Default values in table definitions
- Format: `TYPE:` + `gen_random_uuid()`
- Guaranteed uniqueness
- Stored in respective tables

**Student QR Code**:
```sql
students.qr_code = 'STUDENT:' || gen_random_uuid()
```

**Schedule QR Code**:
```sql  
class_schedules.qr_code = 'SCHEDULE:' || gen_random_uuid()
```

**Manual Generation**:
- Migration function: `generate_missing_qr_codes()`
- Updates any NULL qr_code fields
- Ensures all records have QR codes
- Safe to run multiple times

### QR Code Usage

**Student ID Cards**:
- Student QR code printed on card
- Size: 200x200px
- Quality: High (error correction level H)
- Includes student name and code
- Laminated for durability

**Classroom Displays**:
- Schedule QR codes posted
- Visible at classroom entrance
- Updated per period if needed
- Digital or printed

**Bus Interior**:
- Bus QR code mounted
- Near entrance/exit
- Large enough for easy scanning
- Weatherproof if needed

### QR Code Scanning

**Camera Scanning**:
- Uses html5-qrcode library
- Real-time detection
- 10 FPS scanning rate
- Auto-focus on QR code
- Works in various lighting

**Manual Entry**:
- Fallback for camera issues
- Paste or type QR code string
- Full validation still runs
- Same result as camera scan

**Validation Flow**:
1. Read QR code string
2. Parse type and UUID
3. Query database
4. Verify status (active)
5. Check relationships
6. Validate context
7. Record or reject

---

## Attendance Workflows

### Classroom Attendance Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    Teacher Login                        │
│          /classroom-login?roomId=X&teacherId=Y         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Load Teacher Schedule                       │
│   - Query class_schedules for teacher                   │
│   - Filter by today's day                               │
│   - Join classes, periods, rooms                        │
│   - Sort by period number                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            Display Schedule Cards                        │
│   Period 1: Grade 10-A Math | 08:00-08:45 | Room 101  │
│   Period 2: Grade 10-B Math | 08:50-09:35 | Room 101  │
│   ...                                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          Teacher Selects Period                         │
│   - Click on period card                                │
│   - Card highlights                                     │
│   - "Start Attendance" button appears                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          Activate QR Scanner                            │
│   - Camera initializes                                  │
│   - Scanner interface displays                          │
│   - Ready to scan students                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Student Presents ID Card                        │
│   - Shows QR code to camera                             │
│   - Camera detects and reads                            │
│   - Decodes: STUDENT:uuid                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Call: validate_student_attendance()             │
│   Parameters:                                           │
│   - _student_qr: "STUDENT:uuid"                        │
│   - _schedule_id: selected schedule UUID                │
│   - _recorded_by: teacher UUID                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Validation Logic                           │
│   1. Extract student_id from QR code                    │
│   2. Verify student exists and active                   │
│   3. Get schedule details (class, period, room)         │
│   4. Check class enrollment                             │
│   5. Return validation result (valid/invalid + data)    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
                Is Valid?
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌────────┐             ┌──────────┐
    │  YES   │             │    NO    │
    └────┬───┘             └────┬─────┘
         │                      │
         ▼                      ▼
┌──────────────────┐    ┌─────────────────┐
│ Record Attendance│    │  Show Error     │
│ INSERT INTO:     │    │  - Invalid QR   │
│ attendance_      │    │  - Not enrolled │
│ records          │    │  - Wrong class  │
│                  │    └─────────────────┘
│ student_id       │
│ class_id         │
│ schedule_id      │
│ recorded_by      │
│ status: present  │
│ type: classroom  │
│ date: today      │
│ scanned_at: now  │
└────┬─────────────┘
     │
     ▼
┌─────────────────────┐
│  Show Success       │
│  ✓ [Name] Present   │
│  Add to recent list │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Ready for Next     │
│  Student            │
└─────────────────────┘
```

### Bus Attendance Workflow

```
┌─────────────────────────────────────────────────────────┐
│            Driver Opens Bus Attendance                   │
│                  /bus-attendance                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Load Active Bus Routes                      │
│   - Query bus_routes                                    │
│   - Filter: status = 'active'                           │
│   - Display dropdown list                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Select Bus Route                              │
│   - Choose from dropdown                                │
│   - Load route details                                  │
│   - Display bus information                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Display Bus Information                         │
│   - Route name and code                                 │
│   - Driver name and phone                               │
│   - Departure time                                      │
│   - Bus QR code (for student scanning)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│      Click "Start Scanning Student QR Codes"            │
│   - Camera scanner activates                            │
│   - Ready to scan students                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Student Boards Bus                              │
│   - Shows ID card                                       │
│   - Driver scans QR code                                │
│   - Reads: STUDENT:uuid                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            Validate Student QR                          │
│   1. Extract student ID                                 │
│   2. Query students table                               │
│   3. Check status = 'active'                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
             Student Found?
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌────────┐             ┌──────────┐
    │  YES   │             │    NO    │
    └────┬───┘             └────┬─────┘
         │                      │
         ▼                      ▼
┌──────────────────┐    ┌─────────────────┐
│ Check Bus        │    │  Reject Scan    │
│ Assignment       │    │  "Invalid QR"   │
│                  │    └─────────────────┘
│ Query:           │
│ bus_assignments  │
│ WHERE:           │
│ student_id       │
│ route_id         │
│ status = active  │
└────┬─────────────┘
     │
     ▼
 Assigned to Bus?
     │
┌────┴────┐
│   YES   │
└────┬────┘
     │
     ▼
┌──────────────────┐
│ Record Boarding  │
│ INSERT INTO:     │
│ attendance_      │
│ records          │
│                  │
│ student_id       │
│ bus_route_id     │
│ status: present  │
│ type: bus        │
│ date: today      │
│ scanned_at: now  │
└────┬─────────────┘
     │
     ▼
┌─────────────────────┐
│  Show Success       │
│  ✓ [Name] Boarded   │
│  Add to recent list │
└─────────────────────┘
```

---

## End of Day Procedures

### 14:00 - 14:30: System Closedown

#### Teacher Closedown
1. **Final Period Complete**:
   - Stop scanning
   - Review attendance
   - Close classroom device
   - Log out

2. **Device Security**:
   - Lock device or log out
   - Secure device in classroom
   - Plug in for charging
   - Ready for next day

#### Bus Attendance Complete
1. **Final Route Scans**:
   - All afternoon routes complete
   - All students scanned off
   - Stop scanning
   - Close application

2. **Device Return**:
   - Return scanning devices
   - Charge overnight
   - Report any issues

#### Administrator Review
1. **Quick Attendance Check**:
   - Navigate to Dashboard
   - Review daily stats
   - Check for anomalies
   - Note any issues

2. **Data Verification**:
   - Verify all classes scanned
   - Check bus routes complete
   - Review any error reports
   - Ensure data integrity

### End of Day Reports

**Automated System Tasks**:
1. **Data Consolidation**:
   - All attendance records timestamped
   - Database maintains complete log
   - No manual aggregation needed

2. **Absence Identification**:
   - Students without scans = absent
   - System calculates automatically
   - Absence lists generated

3. **Report Generation**:
   - Daily attendance summary
   - Class-by-class breakdown
   - Bus attendance report
   - Late arrival tracking
   - Absence notifications

4. **Guardian Notifications** (Future Feature):
   - Automated absence alerts
   - Late arrival notifications
   - Bus boarding confirmations
   - Daily attendance summary

### Data Retention

**Database Storage**:
- All attendance records permanent
- Searchable by date, student, class
- Exportable to CSV/Excel
- Archived annually
- 7-year retention standard

**Audit Trail**:
- Every scan timestamped
- Recorded by teacher/driver
- Linked to specific location
- Complete traceability
- Compliance ready

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│                                                          │
│  React + TypeScript + Tailwind CSS                      │
│                                                          │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐        │
│  │  Admin   │  │  Teacher  │  │   Student    │        │
│  │Dashboard │  │ Classroom │  │   Portal     │        │
│  └──────────┘  └───────────┘  └──────────────┘        │
│                                                          │
│  ┌──────────────┐  ┌─────────────────────┐            │
│  │     Bus      │  │  QR Scanner         │            │
│  │  Attendance  │  │  (html5-qrcode)     │            │
│  └──────────────┘  └─────────────────────┘            │
└────────────────────────┬─────────────────────────────┘
                         │
                         │ Supabase Client
                         │
┌────────────────────────┴─────────────────────────────┐
│                  Supabase Backend                      │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │            PostgreSQL Database                │   │
│  │                                               │   │
│  │  Tables:                                      │   │
│  │  - students (with qr_code)                    │   │
│  │  - teachers (with qr_code)                    │   │
│  │  - classes                                    │   │
│  │  - class_schedules (with qr_code)             │   │
│  │  - class_enrollments                          │   │
│  │  - periods                                    │   │
│  │  - rooms                                      │   │
│  │  - bus_routes (with qr_code)                  │   │
│  │  - bus_stops                                  │   │
│  │  - bus_assignments                            │   │
│  │  - attendance_records                         │   │
│  │  - user_roles                                 │   │
│  │  - guardians                                  │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │          Database Functions                   │   │
│  │                                               │   │
│  │  - validate_student_attendance()              │   │
│  │  - generate_missing_qr_codes()                │   │
│  │  - has_role()                                 │   │
│  │  - get_user_teacher_id()                      │   │
│  │  - get_user_student_id()                      │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │         Row Level Security (RLS)              │   │
│  │                                               │   │
│  │  - Role-based access control                  │   │
│  │  - Students see own records                   │   │
│  │  - Teachers see class records                 │   │
│  │  - Admins see all records                     │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │            Authentication                      │   │
│  │                                               │   │
│  │  - Email/Password auth                        │   │
│  │  - Session management                         │   │
│  │  - Auto-confirm enabled                       │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │             Storage                           │   │
│  │                                               │   │
│  │  - student-photos bucket                      │   │
│  │  - Public access for profile images           │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │         Real-time Subscriptions               │   │
│  │                                               │   │
│  │  - Live class updates                         │   │
│  │  - Schedule changes                           │   │
│  │  - Teacher assignments                        │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

### Database Schema Overview

**Core Tables**:

```sql
-- Students with QR codes
students
  - id (UUID, primary key)
  - full_name
  - student_code
  - grade
  - section
  - qr_code (UNIQUE, format: STUDENT:uuid)
  - photo_url
  - date_of_birth
  - blood_type
  - address
  - allergies
  - status (active/inactive)
  - user_id (link to auth)

-- Teachers with QR codes
teachers
  - id (UUID, primary key)
  - full_name
  - email
  - phone
  - teacher_code
  - qr_code (UNIQUE, format: TEACHER:uuid)
  - subjects (array)
  - user_id (link to auth)

-- Classes
classes
  - id (UUID, primary key)
  - name
  - grade
  - section
  - subject
  - teacher_id (FK to teachers)

-- Class Schedules with QR codes
class_schedules
  - id (UUID, primary key)
  - class_id (FK to classes)
  - day (enum: Monday-Friday)
  - period_id (FK to periods)
  - room_id (FK to rooms)
  - week_number (1-4)
  - qr_code (UNIQUE, format: SCHEDULE:uuid)

-- Attendance Records
attendance_records
  - id (UUID, primary key)
  - student_id (FK to students)
  - class_id (FK to classes)
  - schedule_id (FK to class_schedules)
  - bus_route_id (FK to bus_routes)
  - recorded_by (FK to auth.users)
  - status (present/absent/late)
  - type (classroom/bus)
  - date
  - scanned_at (timestamp)
  - notes

-- Class Enrollments
class_enrollments
  - id (UUID, primary key)
  - student_id (FK to students)
  - class_id (FK to classes)
  - enrolled_at (timestamp)

-- Bus Routes with QR codes
bus_routes
  - id (UUID, primary key)
  - name
  - route_code
  - driver_name
  - driver_phone
  - departure_time
  - return_time
  - qr_code (UNIQUE, format: BUS:uuid)
  - status (active/inactive)

-- Bus Assignments
bus_assignments
  - id (UUID, primary key)
  - student_id (FK to students)
  - route_id (FK to bus_routes)
  - stop_id (FK to bus_stops)
  - status (active/inactive)

-- Rooms
rooms
  - id (UUID, primary key)
  - name
  - building
  - floor
  - capacity

-- Periods
periods
  - id (UUID, primary key)
  - period_number
  - start_time
  - end_time
```

### Key Database Functions

**validate_student_attendance()**:
```sql
Purpose: Validates and processes student attendance scan
Input: 
  - _student_qr: Student QR code string
  - _schedule_id: Current class schedule
  - _recorded_by: Teacher user ID
Output: JSONB with validation result
Process:
  1. Parse student ID from QR code
  2. Verify student active status
  3. Get schedule details
  4. Check class enrollment
  5. Return validation result with student info
```

**generate_missing_qr_codes()**:
```sql
Purpose: Generate QR codes for records missing them
Process:
  1. Find students without QR codes
  2. Generate: STUDENT:uuid format
  3. Find teachers without QR codes
  4. Generate: TEACHER:uuid format
  5. Find bus routes without QR codes
  6. Generate: BUS:uuid format
  7. Update schedules with SCHEDULE:uuid
```

### Security Model

**Row Level Security (RLS)**:
- Enabled on all tables
- Role-based access control
- Students: View own records only
- Teachers: View assigned class records
- Admins: Full access to all data

**Authentication**:
- Supabase Auth
- Email/password login
- Session persistence
- Auto-confirm email (dev mode)
- Secure password hashing

**Data Protection**:
- QR codes are opaque UUIDs
- No sensitive data in QR codes
- Encrypted storage
- Secure transmission (HTTPS)
- Audit trails maintained

### Performance Considerations

**Indexes**:
- QR code columns indexed for fast lookup
- Foreign keys indexed
- Date columns indexed for reporting
- Composite indexes on common queries

**Real-time**:
- Supabase real-time subscriptions
- Live updates for schedule changes
- Minimal latency (<100ms)
- Efficient change detection

**Scalability**:
- Handles 1000+ students
- 100+ concurrent scanning sessions
- Database connection pooling
- Optimized queries

---

## Conclusion

This School Attendance Management System provides:

1. **Complete Automation**: No manual attendance registers
2. **Real-Time Tracking**: Instant attendance recording
3. **High Accuracy**: QR code validation ensures correct students
4. **Audit Trail**: Complete timestamped records
5. **Multi-Channel**: Classroom and bus attendance
6. **User-Friendly**: Simple interfaces for all roles
7. **Scalable**: Grows with school size
8. **Secure**: Role-based access, encrypted data
9. **Reliable**: Offline fallbacks, error handling
10. **Comprehensive**: End-to-end attendance solution

The system transforms attendance tracking from a time-consuming manual process into a seamless, automated operation that provides better data, faster reporting, and improved accountability.
