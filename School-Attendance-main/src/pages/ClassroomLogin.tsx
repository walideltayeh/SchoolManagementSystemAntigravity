import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { LogOut, Clock, BookOpen, MapPin, ChevronRight } from "lucide-react";
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

      const filteredData = (data || []).filter((entry: any) =>
        entry.classes?.teacher_id === selectedTeacherId
      );

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
      <div className="min-h-screen flex items-center justify-center bg-apple-gray-50 p-6">
        <div className="bg-white rounded-apple-xl shadow-apple-card p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-apple-gray-800 mb-2">Invalid Access</h2>
          <p className="text-apple-gray-500 mb-6">This page requires a valid room parameter</p>
          <Button
            onClick={() => navigate("/attendance")}
            className="w-full h-12 bg-apple-blue hover:bg-blue-600 text-white rounded-xl"
          >
            Go to Attendance
          </Button>
        </div>
      </div>
    );
  }

  // Show teacher login screen
  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-gray-50 p-6">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25 mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-apple-gray-800">
              Classroom Device
            </h1>
            <p className="mt-2 text-apple-gray-500">
              {roomInfo?.name ? `Room: ${roomInfo.name}` : "Select teacher to continue"}
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-apple-xl shadow-apple-card p-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="teacher-select" className="text-sm font-medium text-apple-gray-700">
                  Select Teacher
                </label>
                <select
                  id="teacher-select"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full h-12 px-4 border border-apple-gray-200 rounded-xl bg-white text-apple-gray-800 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 transition-all"
                >
                  <option value="">-- Select a teacher --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name || teacher.teacher_code}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleTeacherLogin}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium"
                disabled={!selectedTeacherId}
              >
                Login to Classroom
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/attendance")}
                className="w-full h-12 rounded-xl border-apple-gray-200 text-apple-gray-600 hover:bg-apple-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-apple-xl shadow-apple-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-apple-gray-800">Classroom Device</h1>
              <p className="text-sm text-apple-gray-500 mt-1">
                {roomInfo?.name && teacherInfo?.full_name && (
                  <>Room: {roomInfo.name} · Teacher: {teacherInfo.full_name}</>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              size="sm"
              className="rounded-xl border-apple-gray-200 text-apple-gray-600 hover:bg-apple-gray-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Today's Schedule */}
        {todaySchedule.length > 0 ? (
          <div className="bg-white rounded-apple-xl shadow-apple-card p-6">
            <h2 className="text-lg font-semibold text-apple-gray-800 mb-4">Today's Schedule</h2>
            <p className="text-sm text-apple-gray-500 mb-6">Select a period to start attendance</p>
            <div className="space-y-3">
              {todaySchedule.map((schedule) => (
                <button
                  key={schedule.id}
                  onClick={() => {
                    setSelectedSchedule(schedule);
                    setIsScanning(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedSchedule?.id === schedule.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-apple-gray-100 hover:border-apple-gray-200 hover:bg-apple-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-apple-gray-100 border-0 text-apple-gray-600">
                          Period {schedule.period_number}
                        </Badge>
                        <span className="font-medium text-apple-gray-800">
                          {schedule.class_name} - {schedule.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-apple-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {schedule.start_time === "00:00:00" && schedule.end_time === "23:59:59"
                            ? "All Day"
                            : `${schedule.start_time} - ${schedule.end_time}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {schedule.room_name}
                        </span>
                      </div>
                    </div>
                    {selectedSchedule?.id === schedule.id ? (
                      <Badge className="bg-purple-500 hover:bg-purple-500">Selected</Badge>
                    ) : (
                      <ChevronRight className="h-5 w-5 text-apple-gray-300" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-apple-xl shadow-apple-card p-8 text-center">
            <p className="text-apple-gray-500">No classes scheduled for today</p>
          </div>
        )}

        {/* QR Scanner */}
        {selectedSchedule && (
          <div className="space-y-4">
            {!isScanning ? (
              <Button
                onClick={() => setIsScanning(true)}
                size="lg"
                className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-base"
              >
                Start Attendance for Period {selectedSchedule.period_number}
              </Button>
            ) : (
              <>
                <QRScanner onScan={handleScan} isActive={isScanning} />
                <Button
                  onClick={() => setIsScanning(false)}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-apple-gray-200"
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
