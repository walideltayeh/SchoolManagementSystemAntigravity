
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, QrCode, RefreshCw, Clock, Calendar, User, Users, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { dataService, ScanRecord, Room, Teacher } from "@/services/dataService";
import { AttendanceScanner } from "@/components/attendance/AttendanceScanner";
import { BulkClassroomSetup } from "@/components/attendance/BulkClassroomSetup";
import { CameraQRScanner } from "@/components/attendance/CameraQRScanner";
import { supabase } from "@/integrations/supabase/client";

export default function Attendance() {
  const { roomId, teacherId } = useParams();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("classroom");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [busRoutes, setBusRoutes] = useState<any[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load teacher and room data if IDs are provided
  useEffect(() => {
    fetchClasses();
    fetchBusRoutes();

    // Subscribe to real-time updates for classes
    const classesChannel = supabase
      .channel('classes-changes-attendance')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes'
        },
        () => {
          console.log('Classes changed, reloading in Attendance...');
          fetchClasses();
        }
      )
      .subscribe();

    if (roomId) {
      const foundRoom = dataService.getRoom(roomId);
      if (foundRoom) {
        setRoom(foundRoom);
      }
    }

    if (teacherId) {
      const teacher = dataService.getTeachers().find(t => t.id === teacherId);
      if (teacher) {
        setTeacher(teacher);
      } else {
        // If teacher doesn't exist, redirect back to login
        toast({
          title: "Error",
          description: "Teacher not found",
          variant: "destructive",
        });
        navigate("/");
      }
    }

    return () => {
      supabase.removeChannel(classesChannel);
    };
  }, [roomId, teacherId, navigate]);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error loading classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    } else {
      setClasses(data || []);
    }
  };

  const fetchBusRoutes = async () => {
    const { data, error } = await supabase
      .from('bus_routes')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error("Error loading bus routes:", error);
      toast({
        title: "Error",
        description: "Failed to load bus routes",
        variant: "destructive"
      });
    } else {
      setBusRoutes(data || []);
    }
  };

  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStartScan = () => {
    // Validate selection based on tab
    if (activeTab === "classroom") {
      // Determine selected class ID based on grade, section, subject
      const matchingClass = classes.find(c =>
        c.grade === selectedGrade &&
        c.section === selectedSection &&
        c.subject === selectedSubject
      );

      if (!matchingClass) {
        toast({
          title: "Error",
          description: "Could not find a matching class. Please verify your selections.",
          variant: "destructive",
        });
        return;
      }

      // Set the selectedClass to the matching class ID
      setSelectedClass(matchingClass.id);
    } else if (activeTab === "bus") {
      if (!selectedBus) {
        toast({
          title: "Please select a bus route",
          description: "You must select a bus route before starting the scan.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsScanning(true);
    toast({
      title: "Scanner Activated",
      description: "Ready to scan student IDs.",
    });

    // For demo purposes, let's simulate a scan after 2 seconds
    setTimeout(() => {
      simulateScan();
    }, 2000);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setShowCamera(false);
    toast({
      title: "Scanner Deactivated",
      description: "Scanning has been stopped.",
    });
  };

  // Handle bus attendance scan
  const handleBusScan = async (qrCode: string) => {
    if (!selectedBus) {
      toast({
        title: "No Bus Selected",
        description: "Please select a bus route first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Validate it's a student QR code
      if (!qrCode.startsWith("STUDENT:")) {
        toast({
          title: "Invalid QR Code",
          description: "Please scan a valid student QR code",
          variant: "destructive",
        });

        setRecentScans(prev => [{
          id: qrCode,
          name: "Invalid QR",
          success: false,
          time: new Date(),
          message: "Not a student QR code",
        }, ...prev.slice(0, 9)]);
        return;
      }

      // Get student info
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, full_name, student_code")
        .eq("qr_code", qrCode)
        .eq("status", "active")
        .maybeSingle();

      if (studentError) throw studentError;

      if (!studentData) {
        toast({
          title: "Student Not Found",
          description: "Invalid student QR code",
          variant: "destructive",
        });

        setRecentScans(prev => [{
          id: qrCode,
          name: "Unknown Student",
          success: false,
          time: new Date(),
          message: "Student not found",
        }, ...prev.slice(0, 9)]);
        return;
      }

      // Check if student is assigned to this bus
      const { data: assignmentData } = await supabase
        .from("bus_assignments")
        .select("*")
        .eq("student_id", studentData.id)
        .eq("route_id", selectedBus)
        .eq("status", "active")
        .maybeSingle();

      const busRoute = busRoutes.find(b => b.id === selectedBus);

      if (!assignmentData) {
        toast({
          title: "Not Assigned",
          description: `${studentData.full_name} is not assigned to ${busRoute?.name || "this bus"}`,
          variant: "destructive",
        });

        setRecentScans(prev => [{
          id: studentData.id,
          name: studentData.full_name,
          success: false,
          time: new Date(),
          message: "Not assigned to this bus",
        }, ...prev.slice(0, 9)]);
        return;
      }

      // Record bus attendance (class_id is nullable for bus attendance)
      const { error: insertError } = await supabase
        .from("attendance_records")
        .insert([{
          student_id: studentData.id,
          bus_route_id: selectedBus,
          recorded_by: null,
          status: "present",
          type: "bus",
          date: new Date().toISOString().split('T')[0],
          scanned_at: new Date().toISOString(),
        }]);

      if (insertError) {
        // Check if it's a duplicate entry
        if (insertError.code === '23505') {
          toast({
            title: "Already Checked In",
            description: `${studentData.full_name} has already boarded today`,
            variant: "destructive",
          });

          setRecentScans(prev => [{
            id: studentData.id,
            name: studentData.full_name,
            success: false,
            time: new Date(),
            message: "Already checked in today",
          }, ...prev.slice(0, 9)]);
          return;
        }
        throw insertError;
      }

      toast({
        title: "Attendance Recorded",
        description: `${studentData.full_name} boarded successfully`,
      });

      setRecentScans(prev => [{
        id: studentData.id,
        name: studentData.full_name,
        success: true,
        time: new Date(),
        message: "Boarded",
      }, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error("Error recording bus attendance:", error);
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle manual input for bus attendance
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    // Convert student code to QR format
    const qrCode = `STUDENT:${manualInput.trim()}`;

    // Look up by student code instead
    const { data: studentData } = await supabase
      .from("students")
      .select("qr_code")
      .eq("student_code", manualInput.trim())
      .eq("status", "active")
      .maybeSingle();

    if (studentData?.qr_code) {
      await handleBusScan(studentData.qr_code);
    } else {
      toast({
        title: "Student Not Found",
        description: "Invalid student code",
        variant: "destructive",
      });
    }

    setManualInput("");
  };

  // Function to simulate a student scan for demo purposes
  const simulateScan = () => {
    // Get a random student from our database
    const students = dataService.getStudents();
    const randomStudent = students[Math.floor(Math.random() * students.length)];

    // Randomly determine if the scan is successful (90% chance of success)
    const isSuccessful = Math.random() > 0.1;

    // Create a scan record
    const newScan: ScanRecord = {
      id: randomStudent.id,
      name: randomStudent.name,
      time: new Date(),
      success: isSuccessful,
      message: isSuccessful
        ? `Successfully checked in to ${activeTab === "classroom" ? "class" : "bus"}`
        : `Error: ${Math.random() > 0.5 ? "Student not enrolled" : "Invalid ID"}`
    };

    // Add to recent scans
    setRecentScans(prevScans => [newScan, ...prevScans.slice(0, 9)]);

    // Show notification
    if (isSuccessful) {
      toast({
        title: "Attendance Recorded",
        description: `${randomStudent.name} (${randomStudent.id}) checked in successfully.`,
      });
    } else {
      toast({
        title: "Scan Error",
        description: newScan.message,
        variant: "destructive",
      });
    }

    // If still scanning, schedule another scan
    if (isScanning) {
      setTimeout(() => {
        simulateScan();
      }, Math.random() * 5000 + 2000); // Random time between 2-7 seconds
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Handle logout (for classroom device mode)
  const handleLogout = () => {
    navigate("/");
  };

  // Get the selected item name for display
  const getSelectedItemName = () => {
    if (activeTab === "classroom") {
      if (selectedGrade && selectedSection && selectedSubject) {
        return `${selectedGrade} - Section ${selectedSection} - ${selectedSubject}`;
      }
      return "";
    } else {
      const busRoute = busRoutes.find(b => b.id === selectedBus);
      return busRoute ? busRoute.name : "";
    }
  };

  // If in classroom device mode with teacher login
  if (roomId && teacherId && teacher) {
    // Get today's schedule for this room
    const todaySchedules = dataService.getRoomScheduleForToday(roomId);

    // Get teacher's classes - now filtering by teacher_id from Supabase
    const teacherClasses = classes.filter(c => c.teacher_id === teacherId);

    return (
      <div className="space-y-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Classroom Attendance</h2>
            <p className="text-muted-foreground">
              {room?.name} - Logged in as {teacher.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
              <Clock className="h-5 w-5 text-school-primary" />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
            <Button variant="blue-outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>
                  {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaySchedules.length > 0 ? (
                  todaySchedules.map((schedule, index) => (
                    <div
                      key={index}
                      className={`border rounded-md p-3 ${schedule.teacherId === teacherId ? 'bg-primary/10 border-primary/30' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center">
                            {schedule.period}
                          </div>
                          <div>
                            <p className="font-medium">{schedule.className}</p>
                            <p className="text-xs text-muted-foreground">Teacher: {schedule.teacherName}</p>
                          </div>
                        </div>
                        {schedule.teacherId === teacherId && (
                          <Badge>Your Class</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No classes scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance Scanner</CardTitle>
                <CardDescription>
                  Select your class and scan student IDs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-grade-select">Select Class (Grade)</Label>
                  <Select value={selectedGrade} onValueChange={(value) => {
                    setSelectedGrade(value);
                    setSelectedSection("");
                    setSelectedSubject("");
                    setSelectedRoom("");
                    setSelectedClass("");
                  }}>
                    <SelectTrigger id="teacher-grade-select" className="bg-background">
                      <SelectValue placeholder="Select a grade" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border border-border">
                      {[...new Set(teacherClasses.map(c => c.grade))].sort().map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGrade && (
                  <div className="space-y-2">
                    <Label htmlFor="teacher-section-select">Select Section</Label>
                    <Select value={selectedSection} onValueChange={(value) => {
                      setSelectedSection(value);
                      setSelectedSubject("");
                      setSelectedRoom("");
                      setSelectedClass("");
                    }}>
                      <SelectTrigger id="teacher-section-select" className="bg-background">
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-background border border-border">
                        {[...new Set(teacherClasses.filter(c => c.grade === selectedGrade).map(c => c.section))].sort().map((section) => (
                          <SelectItem key={section} value={section}>
                            Section {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedSection && (
                  <div className="space-y-2">
                    <Label htmlFor="teacher-subject-select">Select Subject</Label>
                    <Select value={selectedSubject} onValueChange={(value) => {
                      setSelectedSubject(value);
                      setSelectedRoom("");
                      setSelectedClass("");
                    }}>
                      <SelectTrigger id="teacher-subject-select" className="bg-background">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-background border border-border">
                        {[...new Set(teacherClasses.filter(c => c.grade === selectedGrade && c.section === selectedSection).map(c => c.subject))].filter(subject => subject && subject.trim() !== '').map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedSubject && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Room assignments are managed through class schedules.
                    </p>
                  </div>
                )}

                {!isScanning ? (
                  <Button
                    className="w-full bg-school-primary hover:bg-school-secondary"
                    onClick={handleStartScan}
                    disabled={!selectedGrade || !selectedSection || !selectedSubject}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleStopScan}
                  >
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Stop Scanning
                  </Button>
                )}
              </CardContent>
            </Card>

            <AttendanceScanner
              type="classroom"
              selectedItemName={getSelectedItemName()}
              isScanning={isScanning}
              onStartScan={handleStartScan}
              onStopScan={handleStopScan}
              recentScans={recentScans}
            />
          </div>
        </div>
      </div>
    );
  }

  // Standard attendance page (original behavior)
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Scanner</h2>
          <p className="text-muted-foreground">
            Scan student barcodes for attendance tracking
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
          <Clock className="h-5 w-5 text-school-primary" />
          <span className="font-mono">{formatTime(currentTime)}</span>
        </div>
      </div>

      <Tabs defaultValue="classroom" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="classroom">Classroom Attendance</TabsTrigger>
          <TabsTrigger value="bus">Bus Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="classroom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classroom Setup</CardTitle>
              <CardDescription>
                Configure the scanner for classroom attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <BulkClassroomSetup onSetupComplete={() => {
                toast({
                  title: "Bulk Setup Complete",
                  description: "Classrooms verified successfully",
                });
              }} />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or setup single classroom
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade-select">Select Class (Grade)</Label>
                <Select value={selectedGrade} onValueChange={(value) => {
                  setSelectedGrade(value);
                  setSelectedSection("");
                  setSelectedSubject("");
                  setSelectedRoom("");
                }}>
                  <SelectTrigger id="grade-select" className="bg-background">
                    <SelectValue placeholder="Select a grade" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background border border-border">
                    {[...new Set(classes.map(c => c.grade))].sort().map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedGrade && (
                <div className="space-y-2">
                  <Label htmlFor="section-select">Select Section</Label>
                  <Select value={selectedSection} onValueChange={(value) => {
                    setSelectedSection(value);
                    setSelectedSubject("");
                    setSelectedRoom("");
                  }}>
                    <SelectTrigger id="section-select" className="bg-background">
                      <SelectValue placeholder="Select a section" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border border-border">
                      {[...new Set(classes.filter(c => c.grade === selectedGrade).map(c => c.section))].sort().map((section) => (
                        <SelectItem key={section} value={section}>
                          Section {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedSection && (
                <div className="space-y-2">
                  <Label htmlFor="subject-select">Select Subject</Label>
                  <Select value={selectedSubject} onValueChange={(value) => {
                    setSelectedSubject(value);
                    setSelectedRoom("");
                  }}>
                    <SelectTrigger id="subject-select" className="bg-background">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border border-border">
                      {[...new Set(classes.filter(c => c.grade === selectedGrade && c.section === selectedSection).map(c => c.subject))].filter(subject => subject && subject.trim() !== '').map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedSubject && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Room assignments are managed through class schedules.
                  </p>
                </div>
              )}

              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Classroom Device Mode
                </h4>
                <p className="text-sm text-muted-foreground">
                  Set up a dedicated device in each classroom for attendance tracking:
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => navigate("/classroom-login/RM001")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Open Classroom Device
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              {!isScanning ? (
                <Button
                  className="bg-school-primary hover:bg-school-secondary mr-2"
                  onClick={handleStartScan}
                  disabled={!selectedGrade || !selectedSection || !selectedSubject || !selectedRoom}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={handleStopScan}
                >
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Stop Scanning
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="bus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bus Route Setup</CardTitle>
              <CardDescription>
                Select bus route and scan student QR codes for boarding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bus-select">Select Bus Route</Label>
                <Select value={selectedBus} onValueChange={setSelectedBus}>
                  <SelectTrigger id="bus-select">
                    <SelectValue placeholder="Select a bus route" />
                  </SelectTrigger>
                  <SelectContent>
                    {busRoutes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} - {route.route_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBus && (
                <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                  <h4 className="font-semibold">Bus Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Driver:</p>
                      <p>{busRoutes.find(b => b.id === selectedBus)?.driver_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone:</p>
                      <p>{busRoutes.find(b => b.id === selectedBus)?.driver_phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Departure:</p>
                      <p>{busRoutes.find(b => b.id === selectedBus)?.departure_time}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedBus && (
                <>
                  {/* Manual Input Option */}
                  <div className="space-y-2">
                    <Label htmlFor="manual-student-code">Manual Student Code Entry</Label>
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                      <Input
                        id="manual-student-code"
                        placeholder="Enter student code (e.g., STU8371)"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        disabled={loading}
                      />
                      <Button type="submit" disabled={loading || !manualInput.trim()}>
                        Submit
                      </Button>
                    </form>
                    <p className="text-xs text-muted-foreground">
                      Use this if camera scanning is not available
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or scan with camera
                      </span>
                    </div>
                  </div>

                  {/* Camera Scanner */}
                  {showCamera && (
                    <CameraQRScanner
                      onScan={handleBusScan}
                      isActive={showCamera}
                      onClose={() => setShowCamera(false)}
                    />
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              {selectedBus && !showCamera && (
                <Button
                  className="flex-1 bg-school-primary hover:bg-school-secondary"
                  onClick={() => setShowCamera(true)}
                  disabled={loading}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Start Camera Scanner
                </Button>
              )}
              {showCamera && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCamera(false)}
                >
                  Close Camera
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <AttendanceScanner
        type={activeTab as "classroom" | "bus"}
        selectedItemName={getSelectedItemName()}
        isScanning={isScanning}
        onStartScan={handleStartScan}
        onStopScan={handleStopScan}
        recentScans={recentScans}
      />
    </div>
  );
}
