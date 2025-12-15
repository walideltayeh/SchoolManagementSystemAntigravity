import { useState, useEffect } from "react";
import { Users, QrCode, School, Bus, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCardProps } from "@/components/dashboard/DashboardStats";

interface DashboardData {
  stats: StatCardProps[];
  attendanceData: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
  recentActivities: any[];
  attendanceOverview: {
    present: number;
    absent: number;
    late: number;
    total: number;
    presentPercent: number;
    absentPercent: number;
    trend: string;
  };
  classroomAttendance: Array<{
    grade: string;
    section: string;
    present: number;
    absent: number;
    total: number;
    percentage: number;
  }>;
  busAttendance: Array<{
    route: string;
    present: number;
    absent: number;
    total: number;
    percentage: number;
  }>;
  weekdayData: Array<{
    day: string;
    present: number;
    absent: number;
  }>;
  hourlyData: Array<{
    time: string;
    count: number;
  }>;
}

export function useDashboardData(): DashboardData {
  const [stats, setStats] = useState<StatCardProps[]>([
    {
      title: "Total Students",
      value: "0",
      icon: <Users className="h-5 w-5 text-school-primary" />,
      change: "0%",
      changeType: "neutral",
    },
    {
      title: "Today's Attendance",
      value: "0%",
      icon: <QrCode className="h-5 w-5 text-school-primary" />,
      change: "0%",
      changeType: "neutral",
    },
    {
      title: "Bus Routes",
      value: "0",
      icon: <Bus className="h-5 w-5 text-school-primary" />,
      change: "Active",
      changeType: "neutral",
    },
    {
      title: "Teachers",
      value: "0",
      icon: <BookOpen className="h-5 w-5 text-school-primary" />,
      change: "0",
      changeType: "neutral",
    },
  ]);
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    presentPercent: 0,
    absentPercent: 0,
    trend: "0%"
  });
  const [classroomAttendance, setClassroomAttendance] = useState([]);
  const [busAttendance, setBusAttendance] = useState([]);
  const [weekdayData, setWeekdayData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('=== LOADING DASHBOARD DATA ===');
      
      // Fetch total students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('status', 'active');

      if (studentsError) throw studentsError;
      const totalStudents = students?.length || 0;
      console.log('Total active students:', totalStudents, students);

      // Fetch teachers
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id');

      if (teachersError) throw teachersError;
      const totalTeachers = teachers?.length || 0;
      console.log('Total teachers:', totalTeachers);

      // Fetch active bus routes
      const { data: busRoutes, error: busError } = await supabase
        .from('bus_routes')
        .select('*')
        .eq('status', 'active');

      if (busError) throw busError;
      const totalBusRoutes = busRoutes?.length || 0;
      console.log('Total bus routes:', totalBusRoutes);

      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      console.log('Today date:', today);

      // Fetch today's attendance
      const { data: todayAttendance, error: todayError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('date', today);

      if (todayError) throw todayError;

      const todayPresent = todayAttendance?.filter(r => r.status === 'present').length || 0;
      const todayAbsent = totalStudents - todayPresent;
      const todayPercentage = totalStudents > 0 ? Math.round((todayPresent / totalStudents) * 100) : 0;
      
      console.log('Today attendance:', {
        totalRecords: todayAttendance?.length,
        todayPresent,
        todayAbsent,
        totalStudents,
        todayPercentage
      });

      // Fetch last 7 days attendance for chart
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      const { data: weekAttendance, error: weekError } = await supabase
        .from('attendance_records')
        .select('date, status')
        .gte('date', sevenDaysAgoStr)
        .lte('date', today);

      if (weekError) throw weekError;

      // Group by date
      const attendanceByDate: { [key: string]: { present: number; absent: number; late: number } } = {};
      
      // Initialize all 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        attendanceByDate[dateStr] = { present: 0, absent: 0, late: 0 };
      }

      // Count attendance
      weekAttendance?.forEach((record: any) => {
        if (attendanceByDate[record.date]) {
          if (record.status === 'present') {
            attendanceByDate[record.date].present++;
          } else if (record.status === 'late') {
            attendanceByDate[record.date].late++;
          }
        }
      });

      // Calculate absent (students who didn't have a record)
      Object.keys(attendanceByDate).forEach(date => {
        const totalMarked = attendanceByDate[date].present + attendanceByDate[date].late;
        attendanceByDate[date].absent = Math.max(0, totalStudents - totalMarked);
      });

      const chartData = Object.entries(attendanceByDate).map(([date, counts]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present: counts.present,
        absent: counts.absent,
        late: counts.late
      }));

      setAttendanceData(chartData);

      // Calculate attendance overview (today's data, not 7-day sum)
      const todayLate = todayAttendance?.filter(r => r.status === 'late').length || 0;
      const todayTotal = totalStudents;
      const todayPresentPercent = todayTotal > 0 ? parseFloat(((todayPresent / todayTotal) * 100).toFixed(1)) : 0;
      const todayAbsentPercent = todayTotal > 0 ? parseFloat(((todayAbsent / todayTotal) * 100).toFixed(1)) : 0;

      console.log('Attendance Overview:', {
        present: todayPresent,
        absent: todayAbsent,
        late: todayLate,
        total: todayTotal,
        presentPercent: todayPresentPercent,
        absentPercent: todayAbsentPercent
      });

      setAttendanceOverview({
        present: todayPresent,
        absent: todayAbsent,
        late: todayLate,
        total: todayTotal,
        presentPercent: todayPresentPercent,
        absentPercent: todayAbsentPercent,
        trend: "+5.2%" // You can calculate this based on comparison with previous day
      });

      // Fetch recent activities (last 10 attendance records)
      const { data: recentRecords, error: recentError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          students(full_name, student_code),
          classes(name)
        `)
        .order('scanned_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      const activities = recentRecords?.map((record: any) => ({
        id: record.id,
        type: record.type === 'bus' ? 'bus' : 'attendance',
        description: `${record.students?.full_name || 'Unknown Student'} - ${record.classes?.name || 'Unknown Class'}`,
        user: `${record.status === 'present' ? 'Present' : record.status === 'late' ? 'Late' : 'Absent'} • ${record.type === 'bus' ? 'Bus' : 'Classroom'}`,
        time: record.scanned_at ? new Date(record.scanned_at).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }) : 'N/A'
      })) || [];

      setRecentActivities(activities);

      // Fetch classroom attendance by class
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select(`
          *,
          class_enrollments(student_id)
        `);

      if (classesError) throw classesError;

      const classroomData = await Promise.all((classes || []).map(async (cls: any) => {
        const enrolledCount = cls.class_enrollments?.length || 0;
        
        const { data: classAttendance } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('class_id', cls.id)
          .eq('date', today)
          .eq('status', 'present');

        const present = classAttendance?.length || 0;
        const absent = enrolledCount - present;
        const percentage = enrolledCount > 0 ? parseFloat(((present / enrolledCount) * 100).toFixed(1)) : 0;

        return {
          grade: cls.grade,
          section: cls.section,
          present,
          absent,
          total: enrolledCount,
          percentage
        };
      }));

      setClassroomAttendance(classroomData);

      // Fetch bus attendance
      const busData = await Promise.all((busRoutes || []).map(async (route: any) => {
        const { data: busAssignments } = await supabase
          .from('bus_assignments')
          .select('student_id')
          .eq('route_id', route.id)
          .eq('status', 'active');

        const total = busAssignments?.length || 0;

        const { data: busAttendance } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('bus_route_id', route.id)
          .eq('date', today)
          .eq('type', 'bus')
          .eq('status', 'present');

        const present = busAttendance?.length || 0;
        const absent = total - present;
        const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;

        return {
          route: route.name,
          present,
          absent,
          total,
          percentage
        };
      }));

      setBusAttendance(busData);

      // Fetch weekday pattern (last 5 school days)
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const weekdayData = weekdays.map((day, index) => {
        const dayData = chartData[index];
        const totalForDay = dayData ? dayData.present + dayData.absent + dayData.late : 0;
        const presentPercent = totalForDay > 0 ? parseFloat(((dayData.present / totalForDay) * 100).toFixed(1)) : 0;
        const absentPercent = 100 - presentPercent;

        return {
          day,
          present: presentPercent,
          absent: absentPercent
        };
      });

      setWeekdayData(weekdayData);

      // Fetch hourly check-ins for today
      const { data: hourlyRecords } = await supabase
        .from('attendance_records')
        .select('scanned_at')
        .eq('date', today)
        .not('scanned_at', 'is', null);

      const hourlyCounts: { [key: string]: number } = {};
      
      hourlyRecords?.forEach((record: any) => {
        const hour = new Date(record.scanned_at).getHours();
        const timeLabel = hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
        hourlyCounts[timeLabel] = (hourlyCounts[timeLabel] || 0) + 1;
      });

      const hourlyData = Object.entries(hourlyCounts).map(([time, count]) => ({
        time,
        count
      })).sort((a, b) => {
        const timeA = parseInt(a.time);
        const timeB = parseInt(b.time);
        return timeA - timeB;
      });

      setHourlyData(hourlyData);

      // Update stats
      setStats([
        {
          title: "Total Students",
          value: totalStudents.toString(),
          icon: <Users className="h-5 w-5 text-school-primary" />,
          change: `${totalStudents} enrolled`,
          changeType: "neutral",
        },
        {
          title: "Today's Attendance",
          value: `${todayPercentage}%`,
          icon: <QrCode className="h-5 w-5 text-school-primary" />,
          change: `${todayPresent}/${totalStudents} present`,
          changeType: todayPercentage >= 90 ? "positive" : todayPercentage >= 75 ? "neutral" : "negative",
        },
        {
          title: "Bus Routes",
          value: totalBusRoutes.toString(),
          icon: <Bus className="h-5 w-5 text-school-primary" />,
          change: `${totalBusRoutes} Active`,
          changeType: "neutral",
        },
        {
          title: "Teachers",
          value: totalTeachers.toString(),
          icon: <BookOpen className="h-5 w-5 text-school-primary" />,
          change: `${totalTeachers} active`,
          changeType: "neutral",
        },
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return {
    stats,
    attendanceData,
    recentActivities,
    attendanceOverview,
    classroomAttendance,
    busAttendance,
    weekdayData,
    hourlyData
  };
}
