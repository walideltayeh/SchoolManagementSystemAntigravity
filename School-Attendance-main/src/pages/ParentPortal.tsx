import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Bus, School, AlertCircle, CheckCircle2, XCircle, MinusCircle, TrendingUp, Users, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BusMap from "@/components/parent/BusMap";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Student {
  id: string;
  full_name: string;
  student_code: string;
  grade: string;
  section: string;
  photo_url: string | null;
}

interface ClassSchedule {
  id: string;
  day: string;
  class: {
    name: string;
    subject: string;
  };
  period: {
    period_number: number;
    start_time: string;
    end_time: string;
  };
  room: {
    name: string;
  } | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  type: string;
  scanned_at: string | null;
  student_id?: string;
  class: {
    name: string;
    subject: string;
  } | null;
  bus_route: {
    name: string;
    route_code: string;
  } | null;
}

interface BusInfo {
  route_id: string;
  route: {
    name: string;
    route_code: string;
    driver_name: string;
    driver_phone: string;
    departure_time: string;
    return_time: string;
  };
  stop: {
    name: string;
    location: string;
    arrival_time: string;
  };
}

interface ChildStats {
  student: Student;
  todayStatus: 'present' | 'absent' | 'pending';
  attendanceRate: number;
  totalRecords: number;
  presentRecords: number;
  weeklyAttendance: { [key: string]: 'present' | 'absent' | 'pending' };
}

type PeriodFilter = 'today' | 'week' | 'month';

export default function ParentPortal() {
  const navigate = useNavigate();
  const [guardianEmail, setGuardianEmail] = useState<string | null>(null);

  const [children, setChildren] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [busInfo, setBusInfo] = useState<BusInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // New state for family dashboard
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('week');
  const [familyAttendance, setFamilyAttendance] = useState<AttendanceRecord[]>([]);
  const [childrenStats, setChildrenStats] = useState<ChildStats[]>([]);

  // Check authentication on mount
  useEffect(() => {
    const email = sessionStorage.getItem('parentEmail');
    if (!email) {
      navigate('/parent-login');
      return;
    }
    setGuardianEmail(email);
    loadGuardianChildren(email);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('parentEmail');
    sessionStorage.removeItem('parentPhone');
    navigate('/parent-login');
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  // Load family attendance when children or period changes
  useEffect(() => {
    if (children.length > 0) {
      loadFamilyAttendance();
    }
  }, [children, selectedPeriod]);

  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'today':
        return { start: now, end: now };
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    }
  };

  const loadFamilyAttendance = async () => {
    try {
      const { start, end } = getDateRange();
      const studentIds = children.map(c => c.id);

      const { data: attendanceData, error } = await supabase
        .from('attendance_records')
        .select(`
          id,
          date,
          status,
          type,
          scanned_at,
          student_id,
          class:classes(name, subject),
          bus_route:bus_routes(name, route_code)
        `)
        .in('student_id', studentIds)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))
        .order('scanned_at', { ascending: false });

      if (error) throw error;

      setFamilyAttendance(attendanceData as any || []);
      calculateChildrenStats(attendanceData as any || []);
    } catch (error) {
      console.error('Error loading family attendance:', error);
    }
  };

  const calculateChildrenStats = (attendanceData: AttendanceRecord[]) => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(today, { weekStartsOn: 1 })
    }).filter(d => d.getDay() !== 0 && d.getDay() !== 6); // Only weekdays

    const stats: ChildStats[] = children.map(child => {
      const childAttendance = attendanceData.filter(a => a.student_id === child.id);
      const todayRecords = childAttendance.filter(a => a.date === todayStr);

      // Determine today's status
      let todayStatus: 'present' | 'absent' | 'pending' = 'pending';
      if (todayRecords.some(r => r.status === 'present')) {
        todayStatus = 'present';
      } else if (today.getHours() > 14) { // After 2 PM, mark as absent if no record
        todayStatus = todayRecords.length > 0 ? 'absent' : 'pending';
      }

      // Calculate attendance rate
      const presentRecords = childAttendance.filter(a => a.status === 'present').length;
      const totalRecords = childAttendance.length;
      const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

      // Weekly attendance map
      const weeklyAttendance: { [key: string]: 'present' | 'absent' | 'pending' } = {};
      weekDays.forEach(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayRecords = childAttendance.filter(a => a.date === dayStr);
        if (dayRecords.some(r => r.status === 'present')) {
          weeklyAttendance[dayStr] = 'present';
        } else if (dayRecords.some(r => r.status === 'absent')) {
          weeklyAttendance[dayStr] = 'absent';
        } else if (day <= today) {
          weeklyAttendance[dayStr] = 'pending';
        } else {
          weeklyAttendance[dayStr] = 'pending';
        }
      });

      return {
        student: child,
        todayStatus,
        attendanceRate,
        totalRecords,
        presentRecords,
        weeklyAttendance
      };
    });

    setChildrenStats(stats);
  };

  const loadGuardianChildren = async (email: string) => {
    try {
      setLoading(true);

      // Fetch all students associated with this guardian
      const { data: guardianRecords, error: guardianError } = await supabase
        .from('guardians')
        .select(`
          student_id,
          students:student_id (
            id,
            full_name,
            student_code,
            grade,
            section,
            photo_url
          )
        `)
        .eq('email', email);

      if (guardianError) throw guardianError;

      if (guardianRecords && guardianRecords.length > 0) {
        const studentsList = guardianRecords
          .map(record => record.students)
          .filter(Boolean) as Student[];

        setChildren(studentsList);

        // Select first child by default
        if (studentsList.length > 0) {
          setSelectedStudentId(studentsList[0].id);
        }
      } else {
        toast({
          title: "No Children Found",
          description: "No students are associated with this guardian account.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error loading guardian children:', error);
      toast({
        title: "Error",
        description: "Failed to load student information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (studentId: string) => {
    try {
      // Fetch student info
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData);

      // Fetch class enrollments and schedules
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('student_id', studentData.id);

      if (enrollments && enrollments.length > 0) {
        const classIds = enrollments.map(e => e.class_id);

        const { data: schedulesData } = await supabase
          .from('class_schedules')
          .select(`
            id,
            day,
            class:classes(name, subject),
            period:periods(period_number, start_time, end_time),
            room:rooms(name)
          `)
          .in('class_id', classIds)
          .order('day')
          .order('period(period_number)');

        if (schedulesData) {
          setSchedules(schedulesData as any);
        }
      }

      // Fetch attendance records (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select(`
          id,
          date,
          status,
          type,
          scanned_at,
          class:classes(name, subject),
          bus_route:bus_routes(name, route_code)
        `)
        .eq('student_id', studentData.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('scanned_at', { ascending: false });

      if (attendanceData) {
        setAttendance(attendanceData as any);
      }

      // Fetch bus assignment
      const { data: busAssignment } = await supabase
        .from('bus_assignments')
        .select(`
          route_id,
          route:bus_routes(name, route_code, driver_name, driver_phone, departure_time, return_time),
          stop:bus_stops(name, location, arrival_time)
        `)
        .eq('student_id', studentData.id)
        .eq('status', 'active')
        .single();

      if (busAssignment) {
        setBusInfo(busAssignment as any);
      }

    } catch (error: any) {
      console.error('Error loading student data:', error);
      toast({
        title: "Error",
        description: "Failed to load student information",
        variant: "destructive"
      });
    }
  };

  const getDaySchedules = (day: string) => {
    return schedules.filter(s => s.day === day);
  };

  const getAttendanceStats = () => {
    const classroomAttendance = attendance.filter(a => a.type === 'classroom');
    const busAttendance = attendance.filter(a => a.type === 'bus');

    const classroomPresent = classroomAttendance.filter(a => a.status === 'present').length;
    const busPresent = busAttendance.filter(a => a.status === 'present').length;

    return {
      classroomTotal: classroomAttendance.length,
      classroomPresent,
      classroomRate: classroomAttendance.length > 0
        ? Math.round((classroomPresent / classroomAttendance.length) * 100)
        : 0,
      busTotal: busAttendance.length,
      busPresent,
      busRate: busAttendance.length > 0
        ? Math.round((busPresent / busAttendance.length) * 100)
        : 0,
    };
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: 'present' | 'absent' | 'pending') => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <MinusCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getOverallFamilyRate = () => {
    if (childrenStats.length === 0) return 0;
    const totalRate = childrenStats.reduce((sum, child) => sum + child.attendanceRate, 0);
    return Math.round(totalRate / childrenStats.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading parent portal...</p>
        </div>
      </div>
    );
  }

  if (!student && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              No Children Found
            </CardTitle>
            <CardDescription>
              No students are associated with your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const stats = getAttendanceStats();
  const currentDay = format(new Date(), 'EEEE');
  const todaySchedule = getDaySchedules(currentDay);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  }).filter(d => d.getDay() !== 0 && d.getDay() !== 6);

  return (
    <div className="min-h-screen bg-apple-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Logout */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Parent Portal</h1>
            <p className="text-muted-foreground">{guardianEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-8 w-full justify-start h-auto p-1 bg-white/50 backdrop-blur-sm rounded-full border border-apple-gray-200 inline-flex gap-1">
            <TabsTrigger value="dashboard" className="rounded-full px-4 py-2 data-[state=active]:bg-apple-blue data-[state=active]:text-white data-[state=active]:shadow-sm transition-all hover:bg-apple-gray-100">Dashboard</TabsTrigger>
            <TabsTrigger value="schedule" className="rounded-full px-4 py-2 data-[state=active]:bg-apple-blue data-[state=active]:text-white data-[state=active]:shadow-sm transition-all hover:bg-apple-gray-100">Schedule</TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-full px-4 py-2 data-[state=active]:bg-apple-blue data-[state=active]:text-white data-[state=active]:shadow-sm transition-all hover:bg-apple-gray-100">Attendance</TabsTrigger>
            <TabsTrigger value="bus" className="rounded-full px-4 py-2 data-[state=active]:bg-apple-blue data-[state=active]:text-white data-[state=active]:shadow-sm transition-all hover:bg-apple-gray-100">Bus Info</TabsTrigger>
            <TabsTrigger value="map" className="rounded-full px-4 py-2 data-[state=active]:bg-apple-blue data-[state=active]:text-white data-[state=active]:shadow-sm transition-all hover:bg-apple-gray-100">Bus Tracking</TabsTrigger>
          </TabsList>

          {/* NEW: Family Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Period Filter & Family Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Family Overview
                </h2>
                <p className="text-muted-foreground">
                  {children.length} {children.length === 1 ? 'child' : 'children'} enrolled
                </p>
              </div>
              <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as PeriodFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Overall Family Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Family Attendance Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{getOverallFamilyRate()}%</div>
                  <div className="mt-2 h-2 w-full bg-apple-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getAttendanceColor(getOverallFamilyRate())} transition-all`}
                      style={{ width: `${getOverallFamilyRate()}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">
                        {childrenStats.filter(c => c.todayStatus === 'present').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MinusCircle className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold">
                        {childrenStats.filter(c => c.todayStatus === 'pending').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">
                        {childrenStats.filter(c => c.todayStatus === 'absent').length}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Present / Pending / Absent
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                  <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{familyAttendance.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedPeriod === 'today' ? 'Today' : selectedPeriod === 'week' ? 'This week' : 'This month'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Children Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {childrenStats.map((child) => (
                <Card
                  key={child.student.id}
                  className={`cursor-pointer transition-all hover:shadow-md border-none shadow-sm ${selectedStudentId === child.student.id ? 'ring-2 ring-apple-blue bg-white' : 'bg-white'
                    }`}
                  onClick={() => setSelectedStudentId(child.student.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-apple-gray-50 flex items-center justify-center flex-shrink-0 border border-apple-gray-100">
                        {child.student.photo_url ? (
                          <img src={child.student.photo_url} alt={child.student.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-7 w-7 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">{child.student.full_name}</h3>
                          {getStatusIcon(child.todayStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Grade {child.student.grade} - {child.student.section}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {child.student.student_code}
                        </Badge>
                      </div>
                    </div>

                    {/* Attendance Rate Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Attendance</span>
                        <span className="font-semibold">{child.attendanceRate}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getAttendanceColor(child.attendanceRate)} transition-all`}
                          style={{ width: `${child.attendanceRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {child.presentRecords} of {child.totalRecords} records
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Weekly Overview Table */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
                <CardDescription>Attendance status for the current week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Child</th>
                        {weekDays.map(day => (
                          <th key={day.toISOString()} className="text-center py-3 px-2 font-medium">
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-muted-foreground">
                                {format(day, 'EEE')}
                              </span>
                              <span className={isToday(day) ? 'font-bold text-primary' : ''}>
                                {format(day, 'd')}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {childrenStats.map((child) => (
                        <tr key={child.student.id} className="border-b last:border-0">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                {child.student.photo_url ? (
                                  <img src={child.student.photo_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <span className="font-medium text-sm truncate max-w-[120px]">
                                {child.student.full_name}
                              </span>
                            </div>
                          </td>
                          {weekDays.map(day => {
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const status = child.weeklyAttendance[dayStr] || 'pending';
                            return (
                              <td key={day.toISOString()} className="text-center py-3 px-2">
                                {status === 'present' && (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                )}
                                {status === 'absent' && (
                                  <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                                )}
                                {status === 'pending' && (
                                  <MinusCircle className="h-5 w-5 text-gray-300 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest attendance scans across all children</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {familyAttendance.slice(0, 10).map((record) => {
                    const child = children.find(c => c.id === record.student_id);
                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                            {child?.photo_url ? (
                              <img src={child.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{child?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.type === 'classroom'
                                ? `Class: ${record.class?.subject || 'N/A'}`
                                : `Bus: ${record.bus_route?.route_code || 'N/A'}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                            {record.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {record.scanned_at
                              ? format(new Date(record.scanned_at), 'MMM d, HH:mm')
                              : format(new Date(record.date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {familyAttendance.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No attendance records found for this period
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Child Info Header (shown for other tabs) */}
          {children.length > 1 && (
            <div className="mt-4 mb-2">
              <Card className="border-dashed">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {student.photo_url ? (
                          <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{student.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Grade {student.grade} - {student.section}
                        </p>
                      </div>
                    </div>
                    <Select
                      value={selectedStudentId || undefined}
                      onValueChange={setSelectedStudentId}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Switch child" />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Your child's class timetable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const daySchedules = getDaySchedules(day);
                    return (
                      <div key={day} className="space-y-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {day}
                          {day === currentDay && (
                            <Badge variant="default">Today</Badge>
                          )}
                        </h3>
                        {daySchedules.length > 0 ? (
                          <div className="grid gap-2">
                            {daySchedules.map(schedule => (
                              <div
                                key={schedule.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {schedule.period.start_time} - {schedule.period.end_time}
                                  </div>
                                  <div>
                                    <p className="font-medium">{schedule.class.subject}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Period {schedule.period.period_number}
                                    </p>
                                  </div>
                                </div>
                                {schedule.room && (
                                  <Badge variant="outline">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {schedule.room.name}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground p-3 border rounded-lg">
                            No classes scheduled
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Classroom Attendance</CardTitle>
                  <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.classroomRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.classroomPresent} of {stats.classroomTotal} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bus Attendance</CardTitle>
                  <Bus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.busRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.busPresent} of {stats.busTotal} rides
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todaySchedule.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {currentDay}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bus Route</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {busInfo?.route.route_code || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {busInfo?.route.name || 'Not assigned'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Last 30 days of attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attendance.length > 0 ? (
                    attendance.map(record => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <p className="font-medium">
                              {format(new Date(record.date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {record.type === 'classroom'
                                ? `${record.class?.name} - ${record.class?.subject}`
                                : `Bus ${record.bus_route?.route_code}`}
                            </p>
                            {record.scanned_at && (
                              <p className="text-xs text-muted-foreground">
                                Scanned at {format(new Date(record.scanned_at), 'HH:mm')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                          {record.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No attendance records found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bus" className="space-y-4">
            {busInfo ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Bus Route Information</CardTitle>
                    <CardDescription>Details about your child's bus route</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Route Name</p>
                        <p className="font-medium">{busInfo.route.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Route Code</p>
                        <p className="font-medium">{busInfo.route.route_code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Driver Name</p>
                        <p className="font-medium">{busInfo.route.driver_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Driver Phone</p>
                        <p className="font-medium">{busInfo.route.driver_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Departure Time</p>
                        <p className="font-medium">{busInfo.route.departure_time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Return Time</p>
                        <p className="font-medium">{busInfo.route.return_time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bus Stop Information</CardTitle>
                    <CardDescription>Your child's pickup/drop-off location</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Stop Name</p>
                        <p className="font-medium">{busInfo.stop.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Arrival Time</p>
                        <p className="font-medium">{busInfo.stop.arrival_time}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{busInfo.stop.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bus assignment found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Bus Tracking</CardTitle>
                <CardDescription>
                  {busInfo
                    ? `Track ${busInfo.route.name} in real-time`
                    : 'No bus route assigned'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {busInfo ? (
                  <BusMap routeId={busInfo.route_id} />
                ) : (
                  <div className="h-96 flex items-center justify-center border rounded-lg bg-muted/20">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No bus route to track</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
