
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Schedule {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  roomId: string;
  roomName: string;
  day: string;
  period: number;
  week: number;
  month?: number;
  qrCode?: string;
}

interface Period {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);

  // Load schedules and periods from Supabase
  useEffect(() => {
    loadSchedules();
    loadPeriods();

    // Subscribe to real-time updates
    const schedulesChannel = supabase
      .channel('schedules-changes-calendar')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'class_schedules'
        },
        () => {
          console.log('Schedules changed, reloading in calendar...');
          loadSchedules();
        }
      )
      .subscribe();

    const periodsChannel = supabase
      .channel('periods-changes-calendar')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'periods'
        },
        () => {
          console.log('Periods changed, reloading in calendar...');
          loadPeriods();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(schedulesChannel);
      supabase.removeChannel(periodsChannel);
    };
  }, []);

  const loadSchedules = async () => {
    const { data, error } = await supabase
      .from('class_schedules')
      .select(`
        *,
        classes(id, name, grade, section, subject, teacher_id),
        periods(id, period_number, start_time, end_time),
        rooms:room_id(id, name)
      `)
      .order('day', { ascending: true })
      .order('week_number', { ascending: true });

    if (error) {
      console.error('Error loading schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive",
      });
      return;
    }

    // Transform to match Schedule interface
    const transformedSchedules: Schedule[] = (data || []).map((schedule: any) => {
      const teacher = schedule.classes?.teacher_id;

      return {
        id: schedule.id,
        teacherId: teacher || '',
        teacherName: 'Unassigned', // Will be loaded from teachers table if needed
        classId: schedule.class_id,
        className: schedule.classes
          ? `${schedule.classes.name} (${schedule.classes.subject})`
          : 'Unknown Class',
        roomId: schedule.room_id || '',
        roomName: schedule.rooms?.name || 'TBD',
        day: schedule.day,
        period: schedule.periods?.period_number || 0,
        week: schedule.week_number,
        month: schedule.month,
        qrCode: schedule.qr_code
      };
    });

    // Load teacher names
    const teacherIds = [...new Set(transformedSchedules.map(s => s.teacherId).filter(Boolean))];
    if (teacherIds.length > 0) {
      const { data: teachers } = await supabase
        .from('teachers')
        .select('id, full_name')
        .in('id', teacherIds);

      if (teachers) {
        transformedSchedules.forEach(schedule => {
          const teacher = teachers.find(t => t.id === schedule.teacherId);
          if (teacher) {
            schedule.teacherName = teacher.full_name || 'Unassigned';
          }
        });
      }
    }

    console.log('Loaded schedules from database:', transformedSchedules);
    setSchedules(transformedSchedules);
  };

  const loadPeriods = async () => {
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .order('period_number', { ascending: true });

    if (error) {
      console.error('Error loading periods:', error);
      return;
    }

    const transformedPeriods: Period[] = (data || []).map(p => ({
      id: p.id,
      periodNumber: p.period_number,
      startTime: p.start_time,
      endTime: p.end_time,
      isAllDay: p.is_all_day || false
    }));

    console.log('Loaded periods from database:', transformedPeriods);
    setPeriods(transformedPeriods);
  };

  // Subject color mapping
  // Apple-inspired calendar colors
  const subjectColors: Record<string, string> = {
    "Mathematics": "bg-blue-50 border-blue-200 text-blue-700",
    "Math": "bg-blue-50 border-blue-200 text-blue-700",
    "Science": "bg-green-50 border-green-200 text-green-700",
    "Biology": "bg-green-50 border-green-200 text-green-700",
    "PE": "bg-orange-50 border-orange-200 text-orange-700",
    "Physical Education": "bg-orange-50 border-orange-200 text-orange-700",
    "English": "bg-purple-50 border-purple-200 text-purple-700",
    "Arabic": "bg-amber-50 border-amber-200 text-amber-700",
    "Islamic Studies": "bg-teal-50 border-teal-200 text-teal-700",
    "Art": "bg-pink-50 border-pink-200 text-pink-700",
    "Music": "bg-indigo-50 border-indigo-200 text-indigo-700",
    "Computer Science": "bg-cyan-50 border-cyan-200 text-cyan-700",
    "Social Studies": "bg-yellow-50 border-yellow-200 text-yellow-700",
    "All": "bg-slate-50 border-slate-200 text-slate-700",
  };

  const getSubjectColor = (className: string) => {
    // Extract subject from className format: "KG2 - Section A (Subject)"
    const match = className.match(/\(([^)]+)\)/);
    const subject = match ? match[1] : "";
    return subjectColors[subject] || "bg-gray-100 border-gray-300 dark:bg-gray-900/30 dark:border-gray-700";
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Filter schedules for the selected date based on view type
  const filteredSchedules = date
    ? schedules.filter(schedule => {
      const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].indexOf(schedule.day);
      const selectedDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Adjust Sunday to be 6

      // Calculate week number (1-4) based on the day of the month
      const weekNumber = Math.ceil(date.getDate() / 7);

      // Calculate month (1-12)
      const month = date.getMonth() + 1;

      if (view === "day") {
        // Day view: match only the day of week (ignore week number to show all occurrences)
        const matchesDay = dayIndex === selectedDayIndex;
        const matchesMonth = !schedule.month || schedule.month === month;
        return matchesDay && matchesMonth;
      } else if (view === "month") {
        // Month view: match only the month (show all days and weeks in that month)
        const matchesMonth = !schedule.month || schedule.month === month;
        return matchesMonth;
      } else {
        // Week view: show all schedules (no filtering, handled in the grid view)
        return true;
      }
    })
    : [];

  // Sort by period
  const sortedSchedules = [...filteredSchedules].sort((a, b) => a.period - b.period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">School Calendar</h2>
          <p className="text-muted-foreground">
            View and manage the school schedule.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Date</CardTitle>
            <CardDescription>Select a date to view the schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-3 pointer-events-auto border rounded-md"
              disabled={(date) => date.getDay() === 0 || date.getDay() === 6} // Disable weekends
            />

            <div className="mt-4">
              <Tabs defaultValue="day" onValueChange={(v) => setView(v as "day" | "week" | "month")}>
                <TabsList className="flex items-center gap-1 p-1 bg-apple-gray-100/50 rounded-full w-auto inline-flex">
                  <TabsTrigger value="day" className="rounded-full px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Day</TabsTrigger>
                  <TabsTrigger value="week" className="rounded-full px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Week</TabsTrigger>
                  <TabsTrigger value="month" className="rounded-full px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {date ? format(date, "EEEE, MMMM d, yyyy") : "Select a date"}
            </CardTitle>
            <CardDescription>
              {view === "day"
                ? "Daily schedule"
                : view === "week"
                  ? "Weekly schedule"
                  : "Monthly schedule"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === "week" ? (
              // Weekly Grid View
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-3 bg-apple-gray-50/80 backdrop-blur font-medium text-left min-w-[100px] text-apple-gray-500">Period</th>
                      {days.map(day => (
                        <th key={day} className="border p-3 bg-apple-gray-50/80 backdrop-blur font-medium text-center min-w-[150px] text-apple-gray-500">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.slice(0, 10).map((period) => {
                      const periodSchedules = schedules.filter(s => s.period === period.periodNumber);
                      return (
                        <tr key={period.periodNumber}>
                          <td className="border p-2 bg-muted/30">
                            <div className="font-semibold">Period {period.periodNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {period.isAllDay ? 'All Day' : `${period.startTime} - ${period.endTime}`}
                            </div>
                          </td>
                          {days.map(day => {
                            const daySchedule = periodSchedules.find(s => s.day === day);
                            const colorClasses = daySchedule ? getSubjectColor(daySchedule.className) : "";
                            return (
                              <td key={day} className={`border p-2 ${colorClasses || "bg-background"}`}>
                                {daySchedule ? (
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">{daySchedule.className}</div>
                                    <div className="text-xs opacity-80">
                                      👨‍🏫 {daySchedule.teacherName}
                                    </div>
                                    <div className="text-xs opacity-80">
                                      🚪 {daySchedule.roomName}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center text-muted-foreground text-sm">-</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : sortedSchedules.length > 0 ? (
              // Day/Month View - List Format
              <div className="space-y-4">
                {sortedSchedules.map((schedule, index) => {
                  const periodInfo = periods.find(p => p.periodNumber === schedule.period);
                  const colorClasses = getSubjectColor(schedule.className);
                  return (
                    <div key={index} className={`flex border-2 rounded-lg p-4 hover:shadow-md transition-all ${colorClasses}`}>
                      <div className="min-w-[80px] text-center border-r border-current/20 pr-3">
                        <div className="font-semibold">Period {schedule.period}</div>
                        {periodInfo && (
                          <div className="text-xs opacity-70">
                            {periodInfo.isAllDay ? 'All Day' : `${periodInfo.startTime} - ${periodInfo.endTime}`}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="font-semibold text-lg">{schedule.className}</div>
                        <div className="text-sm opacity-80 mt-1">
                          Teacher: {schedule.teacherName}
                        </div>
                        <div className="text-sm opacity-80">
                          Room: {schedule.roomName}
                        </div>
                      </div>
                      <div className="text-xs opacity-70 self-end font-medium">
                        {schedule.day}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Clock className="w-12 h-12 mb-2 opacity-30" />
                <p>No classes scheduled for this {view}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
