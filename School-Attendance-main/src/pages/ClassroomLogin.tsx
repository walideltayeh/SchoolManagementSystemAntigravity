import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { LogOut, Clock, BookOpen, MapPin } from "lucide-react";
import { QRScanner } from "@/components/attendance/QRScanner";
import { AttendanceScanner } from "@/components/attendance/AttendanceScanner";

interface ScheduleEntry {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
  day: string;
  class_name: string;
  grade: string;
  section: string;
  subject: string;
  room_name: string;
  week_number: number;
}

interface ScanRecord {
  id: string;
  name: string;
  success: boolean;
  time: Date;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  student_id?: string;
  class_id?: string;
  schedule_id?: string;
  student_name?: string;
  class_name?: string;
  grade?: string;
  section?: string;
}

export default function ClassroomLogin() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleEntry[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleEntry | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (roomId) {
      loadRoomInfo();
      loadTeachers();
    }
  }, [roomId]);

  useEffect(() => {
    if (selectedTeacherId && !showLogin) {
      loadTeacherInfo();
      loadTodaySchedule();
    }
  }, [selectedTeacherId, showLogin]);

  const loadRoomInfo = async () => {
    try {
      // Note: roomId from URL is the room NAME (like 'RM001'), not a UUID
      const { data: room } = await supabase
        .from("rooms")
        .select("*")
        .eq("name", roomId)
        .maybeSingle();

      console.log("Room lookup for:", roomId, "Result:", room);
      setRoomInfo(room);
    } catch (error) {
      console.error("Error loading room info:", error);
    }
  };

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("full_name");

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error("Error loading teachers:", error);
    }
  };

  const loadTeacherInfo = async () => {
    try {
      const { data: teacher } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", selectedTeacherId)
        .maybeSingle();

      setTeacherInfo(teacher);
    } catch (error) {
      console.error("Error loading teacher info:", error);
    }
  };

  const handleTeacherLogin = () => {
    if (!selectedTeacherId) {
      toast({
        title: "Select Teacher",
        description: "Please select a teacher to continue",
        variant: "destructive",
      });
      return;
    }
    setShowLogin(false);
  };

  const loadTodaySchedule = async () => {
    try {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
      const todayIndex = new Date().getDay();
      let today: string = dayNames[todayIndex];

      // FOR TESTING: Map weekend to Monday so user can see classes
      if (today === 'Sunday' || today === 'Saturday') {
        console.log("Weekend detected, defaulting to Monday for testing");
        today = 'Monday';
      }

      const { data, error } = await supabase
        .from("class_schedules")
        .select(`
          id,
          day,
          week_number,
          class_id,
          period_id,
          room_id,
          classes!inner(name, grade, section, subject, teacher_id),
          periods!inner(period_number, start_time, end_time, is_all_day),
          rooms!inner(name)
        `)
        .eq("day", today as "Monday");

      if (error) throw error;

      console.log("Schedule query params:", { selectedTeacherId, today });
      console.log("Schedule query raw result:", data);

      // Filter by teacher_id client-side since nested filters on related tables 
      // don't always work correctly with Supabase
      const filteredData = (data || []).filter((entry: any) =>
        entry.classes?.teacher_id === selectedTeacherId
      );

      console.log("Filtered by teacher:", filteredData);

      const scheduleEntries: ScheduleEntry[] = filteredData.map((entry: any) => ({
        id: entry.id,
        period_number: entry.periods.period_number,
        start_time: entry.periods.start_time,
        end_time: entry.periods.end_time,
        day: entry.day,
        class_name: entry.classes.name,
        grade: entry.classes.grade,
        section: entry.classes.section,
        subject: entry.classes.subject,
        room_name: entry.rooms.name,
        week_number: entry.week_number,
      }));

      scheduleEntries.sort((a, b) => a.period_number - b.period_number);
      setTodaySchedule(scheduleEntries);
    } catch (error) {
      console.error("Error loading schedule:", error);
      toast({
        title: "Error",
        description: "Failed to load today's schedule",
        variant: "destructive",
      });
    }
  };

  const handleScan = async (qrCode: string) => {
    if (!selectedSchedule) {
      toast({
        title: "No Period Selected",
        description: "Please select a period first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // If input doesn't start with "STUDENT:", treat it as a student_code and look it up
      let studentQrCode = qrCode;
      if (!qrCode.startsWith("STUDENT:")) {
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("qr_code")
          .eq("student_code", qrCode)
          .maybeSingle();

        if (studentError || !student) {
          toast({
            title: "Student Not Found",
            description: "Invalid student code",
            variant: "destructive",
          });

          setRecentScans(prev => [{
            id: qrCode,
            name: "Unknown Student",
            success: false,
            time: new Date(),
            message: "Invalid student code",
          }, ...prev.slice(0, 9)]);
          setLoading(false);
          return;
        }

        studentQrCode = student.qr_code!;
      }

      // Call the validation function
      const { data: validationData, error: validationError } = await supabase
        .rpc("validate_student_attendance", {
          _student_qr: studentQrCode,
          _schedule_id: selectedSchedule.id,
          _recorded_by: selectedTeacherId,
        });

      if (validationError) throw validationError;

      const validationResult = (validationData as unknown) as ValidationResult;

      if (!validationResult.valid) {
        toast({
          title: "Validation Failed",
          description: validationResult.error || "Unknown error",
          variant: "destructive",
        });

        setRecentScans(prev => [{
          id: qrCode,
          name: "Unknown Student",
          success: false,
          time: new Date(),
          message: validationResult.error || "Invalid QR code",
        }, ...prev.slice(0, 9)]);
        setLoading(false);
        return;
      }

      // Record attendance (recorded_by is null for classroom device)
      // Record attendance using the secure RPC (bypasses RLS)
      const { error: insertError } = await supabase
        .rpc("record_classroom_attendance", {
          _student_id: validationResult.student_id!,
          _class_id: validationResult.class_id!,
          _schedule_id: validationResult.schedule_id!,
          _date: new Date().toISOString().split('T')[0],
          _status: "present",
          _type: "classroom"
        });

      if (insertError) throw insertError;

      toast({
        title: "Attendance Recorded",
        description: `${validationResult.student_name} marked present`,
      });

      setRecentScans(prev => [{
        id: validationResult.student_id!,
        name: validationResult.student_name!,
        success: true,
        time: new Date(),
        message: "Checked In",
      }, ...prev.slice(0, 9)]);

    } catch (error: any) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/attendance");
  };

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Access</CardTitle>
            <CardDescription>
              This page requires a valid room parameter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/attendance")} className="w-full">
              Go to Attendance
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show teacher login screen
  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Classroom Device Login</CardTitle>
            <CardDescription>
              {roomInfo?.name ? `Room: ${roomInfo.name}` : "Select teacher to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="teacher-select" className="text-sm font-medium">
                Select Teacher
              </label>
              <select
                id="teacher-select"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">-- Select a teacher --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name || teacher.teacher_code}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleTeacherLogin} className="w-full" disabled={!selectedTeacherId}>
              Login to Classroom Device
            </Button>
            <Button variant="outline" onClick={() => navigate("/attendance")} className="w-full">
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Classroom Device</CardTitle>
              <CardDescription>
                {roomInfo?.name && teacherInfo?.full_name && (
                  <>Room: {roomInfo.name} | Teacher: {teacherInfo.full_name}</>
                )}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardHeader>
        </Card>

        {/* Today's Schedule */}
        {todaySchedule.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Select a period to start attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {todaySchedule.map((schedule) => (
                  <Card
                    key={schedule.id}
                    className={`cursor-pointer transition-colors ${selectedSchedule?.id === schedule.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                      }`}
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setIsScanning(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Period {schedule.period_number}</Badge>
                            <span className="font-semibold">
                              {schedule.class_name} - {schedule.subject}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {schedule.start_time === "00:00:00" && schedule.end_time === "23:59:59"
                                ? "All Day"
                                : `${schedule.start_time} - ${schedule.end_time}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {schedule.room_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Grade {schedule.grade} - {schedule.section}
                            </span>
                          </div>
                        </div>
                        {selectedSchedule?.id === schedule.id && (
                          <Badge>Selected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No classes scheduled for today
              </p>
            </CardContent>
          </Card>
        )}

        {/* QR Scanner */}
        {selectedSchedule && (
          <div className="space-y-4">
            {!isScanning ? (
              <Button
                onClick={() => setIsScanning(true)}
                size="lg"
                className="w-full"
              >
                Start Attendance for Period {selectedSchedule.period_number}
              </Button>
            ) : (
              <>
                <QRScanner onScan={handleScan} isActive={isScanning} />
                <Button
                  onClick={() => setIsScanning(false)}
                  variant="outline"
                  className="w-full"
                >
                  Stop Scanning
                </Button>
              </>
            )}
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <AttendanceScanner
            type="classroom"
            selectedItemName={selectedSchedule?.class_name || ""}
            isScanning={isScanning}
            onStartScan={() => setIsScanning(true)}
            onStopScan={() => setIsScanning(false)}
            recentScans={recentScans}
          />
        )}
      </div>
    </div>
  );
}
