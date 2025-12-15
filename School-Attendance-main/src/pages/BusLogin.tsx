import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { LogOut, Clock, Bus as BusIcon, MapPin, Phone, User } from "lucide-react";
import { QRScanner } from "@/components/attendance/QRScanner";
import { AttendanceScanner } from "@/components/attendance/AttendanceScanner";

interface BusRoute {
  id: string;
  name: string;
  route_code: string;
  driver_name: string;
  driver_phone: string;
  departure_time: string;
  return_time: string;
}

interface ScanRecord {
  id: string;
  name: string;
  success: boolean;
  time: Date;
  message: string;
}

export default function BusLogin() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [busInfo, setBusInfo] = useState<BusRoute | null>(null);
  const [driverName, setDriverName] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (busId) {
      loadBusInfo();
      loadDrivers();
    }
  }, [busId]);

  const loadBusInfo = async () => {
    try {
      const { data: bus, error } = await supabase
        .from("bus_routes")
        .select("*")
        .eq("id", busId)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      
      if (bus) {
        setBusInfo(bus);
      } else {
        toast({
          title: "Bus Route Not Found",
          description: "This bus route does not exist or is inactive",
          variant: "destructive",
        });
        navigate("/bus-attendance");
      }
    } catch (error) {
      console.error("Error loading bus info:", error);
      toast({
        title: "Error",
        description: "Failed to load bus information",
        variant: "destructive",
      });
    }
  };

  const loadDrivers = async () => {
    try {
      // Load all bus routes to get list of drivers
      const { data, error } = await supabase
        .from("bus_routes")
        .select("driver_name")
        .eq("status", "active")
        .order("driver_name");
      
      if (error) throw error;
      
      // Get unique driver names
      const uniqueDrivers = [...new Set((data || []).map(r => r.driver_name))];
      setDrivers(uniqueDrivers);
    } catch (error) {
      console.error("Error loading drivers:", error);
    }
  };

  const handleDriverLogin = () => {
    if (!selectedDriver) {
      toast({
        title: "Select Driver",
        description: "Please select your name to continue",
        variant: "destructive",
      });
      return;
    }
    setDriverName(selectedDriver);
    setShowLogin(false);
  };

  const handleScan = async (qrCode: string) => {
    if (!busInfo) {
      toast({
        title: "No Bus Selected",
        description: "Bus information is not loaded",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // If input doesn't start with "STUDENT:", treat it as student_code and look it up
      let studentQrCode = qrCode;
      if (!qrCode.startsWith("STUDENT:")) {
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("qr_code")
          .eq("student_code", qrCode)
          .eq("status", "active")
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

      // Validate it's a student QR code
      if (!studentQrCode.startsWith("STUDENT:")) {
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
        setLoading(false);
        return;
      }

      // Get student info
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, full_name, student_code")
        .eq("qr_code", studentQrCode)
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
        setLoading(false);
        return;
      }

      // Check if student is assigned to this bus
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("bus_assignments")
        .select("*")
        .eq("student_id", studentData.id)
        .eq("route_id", busInfo.id)
        .eq("status", "active")
        .maybeSingle();

      if (assignmentError) {
        console.error('Assignment check error:', assignmentError);
      }

      if (!assignmentData) {
        toast({
          title: "Not Assigned",
          description: `${studentData.full_name} is not assigned to this bus`,
          variant: "destructive",
        });
        
        setRecentScans(prev => [{
          id: studentData.id,
          name: studentData.full_name,
          success: false,
          time: new Date(),
          message: "Not assigned to this bus",
        }, ...prev.slice(0, 9)]);
        setLoading(false);
        return;
      }

      // Record bus attendance
      const { error: insertError } = await supabase
        .from("attendance_records")
        .insert({
          student_id: studentData.id,
          class_id: null, // Bus attendance doesn't require a class
          bus_route_id: busInfo.id,
          recorded_by: null, // Bus device doesn't require auth
          status: "present",
          type: "bus",
          date: new Date().toISOString().split('T')[0],
          scanned_at: new Date().toISOString(),
        });

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
          setLoading(false);
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

    } catch (error: any) {
      console.error("Error recording bus attendance:", error);
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
    navigate("/bus-attendance");
  };

  if (!busId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Access</CardTitle>
            <CardDescription>
              This page requires a valid bus route parameter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/bus-attendance")} className="w-full">
              Go to Bus Attendance
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show driver login screen
  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Bus Device Login</CardTitle>
            <CardDescription>
              {busInfo?.name ? `Bus: ${busInfo.name}` : "Select driver to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="driver-select" className="text-sm font-medium">
                Select Driver
              </label>
              <select
                id="driver-select"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">-- Select a driver --</option>
                {drivers.map((driver) => (
                  <option key={driver} value={driver}>
                    {driver}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleDriverLogin} className="w-full" disabled={!selectedDriver}>
              Login to Bus Device
            </Button>
            <Button variant="outline" onClick={() => navigate("/bus-attendance")} className="w-full">
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
              <CardTitle>Bus Device</CardTitle>
              <CardDescription>
                {busInfo?.name && driverName && (
                  <>Bus: {busInfo.name} | Driver: {driverName}</>
                )}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardHeader>
        </Card>

        {/* Bus Route Info */}
        {busInfo && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Bus Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <BusIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{busInfo.name}</span>
                  <Badge variant="outline">{busInfo.route_code}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Driver: {busInfo.driver_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{busInfo.driver_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Departure: {busInfo.departure_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Return: {busInfo.return_time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Scanner */}
        <div className="space-y-4">
          {!isScanning ? (
            <Button
              onClick={() => setIsScanning(true)}
              size="lg"
              className="w-full"
            >
              Start Boarding Attendance
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

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <AttendanceScanner
            type="bus"
            selectedItemName={busInfo?.name || ""}
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
