// Type definitions
export interface Student {
  id: string;
  uuid?: string; // Supabase UUID
  name: string;
  grade: string;
  section: string;
  teacher?: string;
  bloodType: string;
  allergies: boolean;
  busRoute?: string;
  status: "active" | "inactive";
  isEnrolled?: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  subjects: string[];
  classes: string[];
  students: number;
  username?: string;
  password?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  teacher: string;
  teacher_id?: string | null;
  room: string;
  subject: string;
}

export interface BusRoute {
  id: string;
  name: string;
  driver: string;
  phone: string;
  departureTime: string;
  returnTime: string;
  students: number;
  stops: number;
  capacity?: number;
  status: "active" | "inactive";
}

export interface BusStop {
  id: string;
  name: string;
  time: string;
  students: number;
  location: string;
}

export interface BusStudent {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  stop: string;
  status: "active" | "inactive";
}

export interface ScanRecord {
  id: string;
  name: string;
  time: Date;
  success: boolean;
  message: string;
}

export interface ClassSchedule {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  roomId: string;
  roomName: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  period: number;
  week: number;
  month?: number;
  qrCode?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
}

export interface Period {
  periodNumber: number;
  startTime: string;
  endTime: string;
}

// Sample data - 35 students across grades 9-12
const students: Student[] = [
  // Grade 9 - Section A (8 students)
  { id: "STU0001", name: "Emma Williams", grade: "Grade 9", section: "A", teacher: "Sarah Mitchell", bloodType: "O+", allergies: false, busRoute: "BUS0001", status: "active" },
  { id: "STU0002", name: "Liam Johnson", grade: "Grade 9", section: "A", teacher: "Sarah Mitchell", bloodType: "A+", allergies: true, status: "active" },
  { id: "STU0003", name: "Olivia Brown", grade: "Grade 9", section: "A", teacher: "Sarah Mitchell", bloodType: "B+", allergies: false, busRoute: "BUS0002", status: "active" },
  { id: "STU0004", name: "Noah Davis", grade: "Grade 9", section: "A", teacher: "Sarah Mitchell", bloodType: "AB+", allergies: false, status: "active" },
  { id: "STU0005", name: "Ava Martinez", grade: "Grade 9", section: "A", teacher: "Sarah Mitchell", bloodType: "O-", allergies: true, busRoute: "BUS0001", status: "active" },
  { id: "STU0006", name: "Ethan Garcia", grade: "Grade 9", section: "A", teacher: "Sarah Mitchell", bloodType: "A-", allergies: false, status: "active" },
  { id: "STU0007", name: "Sophia Rodriguez", grade: "Grade 9", section: "A", teacher: "Sarah Mitchell", bloodType: "B-", allergies: false, busRoute: "BUS0003", status: "active" },
  { id: "STU0008", name: "Mason Wilson", grade: "Grade 9", section: "A", teacher: "Sarah Mitchell", bloodType: "O+", allergies: false, status: "active" },

  // Grade 9 - Section B (6 students)
  { id: "STU0009", name: "Isabella Anderson", grade: "Grade 9", section: "B", teacher: "Sarah Mitchell", bloodType: "A+", allergies: false, busRoute: "BUS0002", status: "active" },
  { id: "STU0010", name: "William Taylor", grade: "Grade 9", section: "B", teacher: "Sarah Mitchell", bloodType: "O+", allergies: false, status: "active" },
  { id: "STU0011", name: "Mia Thomas", grade: "Grade 9", section: "B", teacher: "Sarah Mitchell", bloodType: "B+", allergies: false, busRoute: "BUS0001", status: "active" },
  { id: "STU0012", name: "James Moore", grade: "Grade 9", section: "B", teacher: "Sarah Mitchell", bloodType: "AB+", allergies: true, status: "active" },
  { id: "STU0013", name: "Charlotte Jackson", grade: "Grade 9", section: "B", teacher: "Sarah Mitchell", bloodType: "O-", allergies: false, busRoute: "BUS0003", status: "active" },
  { id: "STU0014", name: "Benjamin White", grade: "Grade 9", section: "B", teacher: "Sarah Mitchell", bloodType: "A-", allergies: false, status: "active" },

  // Grade 10 - Section A (6 students)
  { id: "STU0015", name: "Amelia Harris", grade: "Grade 10", section: "A", teacher: "John Anderson", bloodType: "B-", allergies: false, busRoute: "BUS0002", status: "active" },
  { id: "STU0016", name: "Lucas Martin", grade: "Grade 10", section: "A", teacher: "John Anderson", bloodType: "O+", allergies: false, status: "active" },
  { id: "STU0017", name: "Harper Thompson", grade: "Grade 10", section: "A", teacher: "John Anderson", bloodType: "A+", allergies: true, busRoute: "BUS0001", status: "active" },
  { id: "STU0018", name: "Alexander Lee", grade: "Grade 10", section: "A", teacher: "John Anderson", bloodType: "B+", allergies: false, status: "active" },
  { id: "STU0019", name: "Evelyn Walker", grade: "Grade 10", section: "A", teacher: "John Anderson", bloodType: "AB+", allergies: false, status: "active" },
  { id: "STU0020", name: "Daniel Hall", grade: "Grade 10", section: "A", teacher: "John Anderson", bloodType: "O-", allergies: false, busRoute: "BUS0003", status: "active" },

  // Grade 10 - Section B (5 students)
  { id: "STU0021", name: "Abigail Allen", grade: "Grade 10", section: "B", teacher: "John Anderson", bloodType: "A-", allergies: false, status: "active" },
  { id: "STU0022", name: "Matthew Young", grade: "Grade 10", section: "B", teacher: "John Anderson", bloodType: "B-", allergies: false, busRoute: "BUS0002", status: "active" },
  { id: "STU0023", name: "Emily King", grade: "Grade 10", section: "B", teacher: "John Anderson", bloodType: "O+", allergies: false, status: "active" },
  { id: "STU0024", name: "Joseph Wright", grade: "Grade 10", section: "B", teacher: "John Anderson", bloodType: "A+", allergies: true, busRoute: "BUS0001", status: "active" },
  { id: "STU0025", name: "Elizabeth Scott", grade: "Grade 10", section: "B", teacher: "John Anderson", bloodType: "B+", allergies: false, status: "active" },

  // Grade 11 - Section A (5 students)
  { id: "STU0026", name: "David Green", grade: "Grade 11", section: "A", teacher: "Dr. Emily Thompson", bloodType: "AB+", allergies: false, busRoute: "BUS0003", status: "active" },
  { id: "STU0027", name: "Sofia Adams", grade: "Grade 11", section: "A", teacher: "Dr. Emily Thompson", bloodType: "O-", allergies: false, status: "active" },
  { id: "STU0028", name: "Jackson Baker", grade: "Grade 11", section: "A", teacher: "Dr. Emily Thompson", bloodType: "A-", allergies: false, busRoute: "BUS0002", status: "active" },
  { id: "STU0029", name: "Avery Nelson", grade: "Grade 11", section: "A", teacher: "Dr. Emily Thompson", bloodType: "B-", allergies: true, status: "active" },
  { id: "STU0030", name: "Samuel Carter", grade: "Grade 11", section: "A", teacher: "Dr. Emily Thompson", bloodType: "O+", allergies: false, busRoute: "BUS0001", status: "active" },

  // Grade 12 - Section A (5 students)
  { id: "STU0031", name: "Grace Mitchell", grade: "Grade 12", section: "A", teacher: "Sarah Mitchell", bloodType: "A+", allergies: false, status: "active" },
  { id: "STU0032", name: "Henry Perez", grade: "Grade 12", section: "A", teacher: "Sarah Mitchell", bloodType: "B+", allergies: false, busRoute: "BUS0003", status: "active" },
  { id: "STU0033", name: "Chloe Roberts", grade: "Grade 12", section: "A", teacher: "Sarah Mitchell", bloodType: "AB+", allergies: false, status: "active" },
  { id: "STU0034", name: "Sebastian Turner", grade: "Grade 12", section: "A", teacher: "Sarah Mitchell", bloodType: "O-", allergies: true, busRoute: "BUS0002", status: "active" },
  { id: "STU0035", name: "Victoria Phillips", grade: "Grade 12", section: "A", teacher: "Sarah Mitchell", bloodType: "A-", allergies: false, status: "active" }
];

const teachers: Teacher[] = [
  { id: "TCH0001", name: "John Anderson", email: "j.anderson@school.edu", phone: "555-0101", subject: "Mathematics", subjects: ["Mathematics", "Algebra", "Geometry"], classes: [], students: 0, username: "janderson", password: "teacher123" },
  { id: "TCH0002", name: "Dr. Emily Thompson", email: "e.thompson@school.edu", phone: "555-0102", subject: "Science", subjects: ["Science", "Biology", "Chemistry"], classes: [], students: 0, username: "ethompson", password: "teacher123" },
  { id: "TCH0003", name: "Sarah Mitchell", email: "s.mitchell@school.edu", phone: "555-0103", subject: "English", subjects: ["English", "Literature", "Creative Writing"], classes: [], students: 0, username: "smitchell", password: "teacher123" },
  { id: "TCH0004", name: "Robert Davis", email: "r.davis@school.edu", phone: "555-0104", subject: "History", subjects: ["History", "Geography", "Social Studies"], classes: [], students: 0, username: "rdavis", password: "teacher123" },
  { id: "TCH0005", name: "Lisa Chen", email: "l.chen@school.edu", phone: "555-0105", subject: "Computer Science", subjects: ["Computer Science", "Programming", "Web Development"], classes: [], students: 0, username: "lchen", password: "teacher123" },
  { id: "TCH0006", name: "Michael Brown", email: "m.brown@school.edu", phone: "555-0106", subject: "Physical Education", subjects: ["PE", "Health", "Sports"], classes: [], students: 0, username: "mbrown", password: "teacher123" },
  { id: "TCH0007", name: "Jennifer Garcia", email: "j.garcia@school.edu", phone: "555-0107", subject: "Arts", subjects: ["Art", "Music", "Drama"], classes: [], students: 0, username: "jgarcia", password: "teacher123" },
  { id: "TCH0008", name: "Carlos Rodriguez", email: "c.rodriguez@school.edu", phone: "555-0108", subject: "Spanish", subjects: ["Spanish", "French", "Languages"], classes: [], students: 0, username: "crodriguez", password: "teacher123" }
];

const classes: ClassInfo[] = [
  // Grade 9 - Section A
  { id: "CLS0001", name: "Grade 9 - Section A", teacher: "John Anderson", room: "Room 02", subject: "Mathematics" },
  { id: "CLS0002", name: "Grade 9 - Section A", teacher: "Dr. Emily Thompson", room: "Room 01", subject: "Science" },
  { id: "CLS0003", name: "Grade 9 - Section A", teacher: "Sarah Mitchell", room: "Room 03", subject: "English" },
  { id: "CLS0004", name: "Grade 9 - Section A", teacher: "Robert Davis", room: "Room 04", subject: "History" },

  // Grade 9 - Section B
  { id: "CLS0005", name: "Grade 9 - Section B", teacher: "John Anderson", room: "Room 02", subject: "Mathematics" },
  { id: "CLS0006", name: "Grade 9 - Section B", teacher: "Dr. Emily Thompson", room: "Room 10", subject: "Science" },
  { id: "CLS0007", name: "Grade 9 - Section B", teacher: "Sarah Mitchell", room: "Room 03", subject: "English" },
  { id: "CLS0008", name: "Grade 9 - Section B", teacher: "Robert Davis", room: "Room 04", subject: "History" },

  // Grade 10 - Section A
  { id: "CLS0009", name: "Grade 10 - Section A", teacher: "John Anderson", room: "Room 02", subject: "Mathematics" },
  { id: "CLS0010", name: "Grade 10 - Section A", teacher: "Dr. Emily Thompson", room: "Room 01", subject: "Science" },
  { id: "CLS0011", name: "Grade 10 - Section A", teacher: "Sarah Mitchell", room: "Room 03", subject: "English" },
  { id: "CLS0012", name: "Grade 10 - Section A", teacher: "Lisa Chen", room: "Room 05", subject: "Computer Science" },

  // Grade 10 - Section B
  { id: "CLS0013", name: "Grade 10 - Section B", teacher: "John Anderson", room: "Room 02", subject: "Mathematics" },
  { id: "CLS0014", name: "Grade 10 - Section B", teacher: "Dr. Emily Thompson", room: "Room 10", subject: "Science" },
  { id: "CLS0015", name: "Grade 10 - Section B", teacher: "Carlos Rodriguez", room: "Room 07", subject: "Spanish" },
  { id: "CLS0016", name: "Grade 10 - Section B", teacher: "Robert Davis", room: "Room 04", subject: "History" },

  // Grade 11 - Section A
  { id: "CLS0017", name: "Grade 11 - Section A", teacher: "John Anderson", room: "Room 02", subject: "Mathematics" },
  { id: "CLS0018", name: "Grade 11 - Section A", teacher: "Dr. Emily Thompson", room: "Room 01", subject: "Science" },
  { id: "CLS0019", name: "Grade 11 - Section A", teacher: "Sarah Mitchell", room: "Room 03", subject: "English" },
  { id: "CLS0020", name: "Grade 11 - Section A", teacher: "Lisa Chen", room: "Room 05", subject: "Computer Science" },

  // Grade 12 - Section A
  { id: "CLS0021", name: "Grade 12 - Section A", teacher: "John Anderson", room: "Room 02", subject: "Mathematics" },
  { id: "CLS0022", name: "Grade 12 - Section A", teacher: "Dr. Emily Thompson", room: "Room 01", subject: "Science" },
  { id: "CLS0023", name: "Grade 12 - Section A", teacher: "Sarah Mitchell", room: "Room 03", subject: "English" },
  { id: "CLS0024", name: "Grade 12 - Section A", teacher: "Jennifer Garcia", room: "Room 06", subject: "Arts" }
];

const busRoutes: BusRoute[] = [
  { id: "BUS0001", name: "North Route", driver: "John Smith", phone: "555-0201", departureTime: "07:00", returnTime: "15:30", students: 6, stops: 4, capacity: 40, status: "active" },
  { id: "BUS0002", name: "South Route", driver: "Maria Johnson", phone: "555-0202", departureTime: "07:15", returnTime: "15:45", students: 7, stops: 3, capacity: 45, status: "active" },
  { id: "BUS0003", name: "East Route", driver: "Robert Williams", phone: "555-0203", departureTime: "07:10", returnTime: "15:40", students: 5, stops: 3, capacity: 38, status: "active" }
];

const busStops: BusStop[] = [
  // North Route stops
  { id: "STP0001", name: "Maple Street Stop", time: "07:05", students: 2, location: "North District" },
  { id: "STP0002", name: "Oak Avenue Stop", time: "07:15", students: 2, location: "North District" },
  { id: "STP0003", name: "Pine Road Stop", time: "07:25", students: 1, location: "North District" },
  { id: "STP0004", name: "Cedar Lane Stop", time: "07:35", students: 1, location: "North District" },

  // South Route stops
  { id: "STP0005", name: "Downtown Plaza", time: "07:20", students: 3, location: "South District" },
  { id: "STP0006", name: "Market Street", time: "07:30", students: 2, location: "South District" },
  { id: "STP0007", name: "River Road", time: "07:40", students: 2, location: "South District" },

  // East Route stops
  { id: "STP0008", name: "Hill Street", time: "07:15", students: 2, location: "East District" },
  { id: "STP0009", name: "Valley Drive", time: "07:25", students: 2, location: "East District" },
  { id: "STP0010", name: "Mountain View", time: "07:35", students: 1, location: "East District" }
];

const busStudents: BusStudent[] = [
  // This array can be populated with detailed bus student assignments if needed
  // Currently students have busRoute assignments in the main students array
];

// Dashboard data - Updated for 35 students
const attendanceData: any[] = [
  { date: "2024-12-01", present: 34, absent: 1, late: 0 },
  { date: "2024-12-02", present: 35, absent: 0, late: 0 },
  { date: "2024-12-03", present: 33, absent: 1, late: 1 },
  { date: "2024-12-04", present: 35, absent: 0, late: 0 },
  { date: "2024-12-05", present: 34, absent: 0, late: 1 }
];

const performanceData: any[] = [
  { subject: "Mathematics", average: 82 },
  { subject: "Science", average: 78 },
  { subject: "English", average: 85 },
  { subject: "History", average: 76 },
  { subject: "Art", average: 90 }
];

const recentActivities: any[] = [
  { id: 1, type: "attendance", description: "Morning attendance completed", time: "08:30 AM", user: "Admin" },
  { id: 2, type: "bus", description: "All buses departed", time: "08:15 AM", user: "Transport Manager" },
  { id: 3, type: "student", description: "New student registered", time: "Yesterday", user: "Registrar" },
  { id: 4, type: "event", description: "Science fair scheduled", time: "Yesterday", user: "Event Coordinator" }
];

const upcomingEvents: any[] = [
  { id: 1, title: "Parent-Teacher Meeting", date: "2023-04-25", time: "03:00 PM - 06:00 PM" },
  { id: 2, title: "Science Fair", date: "2023-05-10", time: "09:00 AM - 02:00 PM" },
  { id: 3, title: "Sports Day", date: "2023-05-15", time: "All Day" },
  { id: 4, title: "End of Term Exam", date: "2023-06-05", time: "09:00 AM - 12:00 PM" }
];

// Preset rooms from Room 01 to Room 100
const rooms: Room[] = Array.from({ length: 100 }, (_, i) => ({
  id: `RM${String(i + 1).padStart(3, '0')}`,
  name: `Room ${String(i + 1).padStart(2, '0')}`,
  capacity: Math.floor(Math.random() * 20) + 20,
  available: true
}));

// Class schedules
const classSchedules: ClassSchedule[] = [];

// Data service class
class DataService {
  // Student methods
  getStudents(): Student[] {
    return students;
  }

  searchStudents(query: string): Student[] {
    const lowercaseQuery = query.toLowerCase();
    return students.filter(student =>
      student.name.toLowerCase().includes(lowercaseQuery) ||
      student.id.toLowerCase().includes(lowercaseQuery) ||
      student.grade.toLowerCase().includes(lowercaseQuery) ||
      student.teacher.toLowerCase().includes(lowercaseQuery)
    );
  }

  addStudent(student: Omit<Student, "id">): Student {
    const id = `STU${String(students.length + 1).padStart(4, '0')}`;
    const newStudent = { ...student, id };
    students.push(newStudent);

    // Find matching teacher from class assignments
    // Get the first part of the class name assigned to the student (Grade X) 
    // and the section to find the full class name
    const classFullName = `${student.grade} - Section ${student.section}`;

    // Find all teachers who teach this class
    const matchingTeachers = teachers.filter(teacher =>
      teacher.classes.some(cls => cls.includes(classFullName))
    );

    // If we have matching teachers but the student's teacher isn't specified, use the first match
    if (matchingTeachers.length > 0 && (!student.teacher || student.teacher.trim() === "")) {
      newStudent.teacher = matchingTeachers[0].name;
    }

    // Update teacher's student count
    const teacherIndex = teachers.findIndex(t => t.name === student.teacher);

    if (teacherIndex !== -1) {
      teachers[teacherIndex].students += 1;
    }

    // Update bus route's student count if applicable
    if (student.busRoute) {
      const busRouteIndex = busRoutes.findIndex(r => r.id === student.busRoute);
      if (busRouteIndex !== -1) {
        busRoutes[busRouteIndex].students += 1;
      }
    }

    return newStudent;
  }

  // Teacher methods
  getTeachers(): Teacher[] {
    return teachers;
  }

  addTeacher(teacher: Omit<Teacher, "id">): Teacher {
    const id = `TCH${String(teachers.length + 1).padStart(4, '0')}`;
    const newTeacher = { ...teacher, id };
    teachers.push(newTeacher);
    return newTeacher;
  }

  updateTeacher(teacherId: string, updatedTeacher: Partial<Teacher>): Teacher | null {
    const index = teachers.findIndex(t => t.id === teacherId);
    if (index === -1) return null;

    teachers[index] = { ...teachers[index], ...updatedTeacher };
    return teachers[index];
  }

  // Class methods
  getClasses(): ClassInfo[] {
    return classes;
  }

  addClass(classInfo: Omit<ClassInfo, "id">): ClassInfo {
    const id = `CLS${String(classes.length + 1).padStart(4, '0')}`;
    const newClass = { ...classInfo, id };
    classes.push(newClass);
    return newClass;
  }

  updateClass(classId: string, updatedClass: Partial<ClassInfo>): ClassInfo | null {
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) return null;

    const oldClass = { ...classes[index] };
    const newClass = { ...classes[index], ...updatedClass };
    classes[index] = newClass;

    // Update teacher's classes array if the class name changed
    if (oldClass.name !== newClass.name || oldClass.subject !== newClass.subject) {
      const oldClassName = `${oldClass.name} (${oldClass.subject})`;
      const newClassName = `${newClass.name} (${newClass.subject})`;

      teachers.forEach(teacher => {
        const classIndex = teacher.classes.findIndex(cls => cls === oldClassName);
        if (classIndex !== -1) {
          teacher.classes[classIndex] = newClassName;
        }
      });
    }

    // Update students if grade or section changed
    if (oldClass.name !== newClass.name) {
      const oldGrade = oldClass.name.split(' - ')[0];
      const oldSection = oldClass.name.split('Section ')[1];
      const newGrade = newClass.name.split(' - ')[0];
      const newSection = newClass.name.split('Section ')[1];

      students.forEach(student => {
        if (student.grade === oldGrade && student.section === oldSection) {
          student.grade = newGrade;
          student.section = newSection;
        }
      });
    }

    return newClass;
  }

  deleteClass(classId: string): boolean {
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) return false;

    const deletedClass = classes[index];
    classes.splice(index, 1);

    // Remove from teacher's classes array
    const className = `${deletedClass.name} (${deletedClass.subject})`;
    teachers.forEach(teacher => {
      teacher.classes = teacher.classes.filter(cls => cls !== className);
    });

    return true;
  }

  // Bus methods
  getBusRoutes(): BusRoute[] {
    return busRoutes;
  }

  addBusRoute(route: Omit<BusRoute, "id">): BusRoute {
    const id = `BUS${String(busRoutes.length + 1).padStart(4, '0')}`;
    const newRoute = { ...route, id };
    busRoutes.push(newRoute);
    return newRoute;
  }

  getBusStops(): BusStop[] {
    return busStops;
  }

  getBusStudents(): BusStudent[] {
    return busStudents;
  }

  addBusStudent(student: Omit<BusStudent, "id">): BusStudent {
    const id = `BSTU${String(busStudents.length + 1).padStart(4, '0')}`;
    const newBusStudent = { ...student, id };
    busStudents.push(newBusStudent);
    return newBusStudent;
  }

  // Room methods
  getRooms(): Room[] {
    return rooms;
  }

  getRoom(roomId: string): Room | undefined {
    return rooms.find(room => room.id === roomId);
  }

  // Check if a room name is valid (between Room 01 and Room 100)
  isValidRoomName(roomName: string): boolean {
    const roomNumberMatch = roomName.match(/Room (\d+)/i);
    if (!roomNumberMatch) return false;

    const roomNumber = parseInt(roomNumberMatch[1]);
    return roomNumber >= 1 && roomNumber <= 100;
  }

  // Schedule methods
  getClassSchedules(): ClassSchedule[] {
    return classSchedules;
  }

  getTeacherSchedules(teacherId: string): ClassSchedule[] {
    return classSchedules.filter(schedule => schedule.teacherId === teacherId);
  }

  getRoomSchedules(roomId: string): ClassSchedule[] {
    return classSchedules.filter(schedule => schedule.roomId === roomId);
  }

  getSchedulesByDay(day: string, week: number = 1): ClassSchedule[] {
    return classSchedules.filter(
      schedule => schedule.day === day && schedule.week === week
    );
  }

  addClassSchedule(schedule: Omit<ClassSchedule, "id">): ClassSchedule {
    const id = `SCH${String(classSchedules.length + 1).padStart(4, '0')}`;
    const newSchedule = { ...schedule, id };
    classSchedules.push(newSchedule);
    return newSchedule;
  }

  // Dashboard methods
  getAttendanceData() {
    return attendanceData;
  }

  getPerformanceData() {
    return performanceData;
  }

  getRecentActivities() {
    return recentActivities;
  }

  getUpcomingEvents() {
    return upcomingEvents;
  }

  // Data management
  deleteAllData() {
    // Clear all arrays
    students.length = 0;
    teachers.length = 0;
    classes.length = 0;
    busRoutes.length = 0;
    busStops.length = 0;
    busStudents.length = 0;
    classSchedules.length = 0;

    // Reset room availability
    rooms.forEach(room => {
      room.available = true;
    });

    // Clear dashboard data
    attendanceData.length = 0;
    performanceData.length = 0;
    recentActivities.length = 0;
    upcomingEvents.length = 0;

    console.log("All data has been deleted successfully");
  }

  // Verify teacher login
  verifyTeacherLogin(username: string, password: string): Teacher | null {
    const teacher = teachers.find(t => t.username === username && t.password === password);
    return teacher || null;
  }

  // Get today's schedule for a specific room
  getRoomScheduleForToday(roomId: string): ClassSchedule[] {
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = dayNames[today.getDay()];

    // Get the current week number (simplified to modulo 4 + 1)
    const currentWeek = (Math.floor(today.getDate() / 7) % 4) + 1;

    return classSchedules.filter(
      schedule => schedule.roomId === roomId &&
        schedule.day === currentDay &&
        (schedule.week === currentWeek || schedule.week === 1)
    );
  }

  // Period methods
  getPeriods(): Period[] {
    const periods = localStorage.getItem('school_periods');
    return periods ? JSON.parse(periods) : [];
  }

  addOrUpdatePeriod(period: Period): Period {
    const periods = this.getPeriods();

    // Find existing period with same number
    const existingIndex = periods.findIndex(p => p.periodNumber === period.periodNumber);

    if (existingIndex >= 0) {
      // Update existing period
      periods[existingIndex] = period;
    } else {
      // Add new period
      periods.push(period);
    }

    // Sort periods by number
    periods.sort((a, b) => a.periodNumber - b.periodNumber);

    localStorage.setItem('school_periods', JSON.stringify(periods));
    return period;
  }
}

// Create and export a singleton instance
export const dataService = new DataService();

// Export specific arrays for direct access if needed
export {
  busStops,
  busStudents,
  rooms,
  classSchedules
};
