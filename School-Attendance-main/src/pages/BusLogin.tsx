import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { LogOut, Clock, Bus as BusIcon, Phone, User } from "lucide-react";
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
      const { data, error } = await supabase
        .from("bus_routes")
        .select("driver_name")
        .eq("status", "active")
        .order("driver_name");

      if (error) throw error;

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

      const { error: insertError } = await supabase
        .from("attendance_records")
        .insert({
          student_id: studentData.id,
          class_id: null,
          bus_route_id: busInfo.id,
          recorded_by: null,
          status: "present",
          type: "bus",
          date: new Date().toISOString().split('T')[0],
          scanned_at: new Date().toISOString(),
        });

      if (insertError) {
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
      <div className="min-h-screen flex items-center justify-center bg-apple-gray-50 p-6">
        <div className="bg-white rounded-apple-xl shadow-apple-card p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-apple-gray-800 mb-2">Invalid Access</h2>
          <p className="text-apple-gray-500 mb-6">This page requires a valid bus route parameter</p>
          <Button
            onClick={() => navigate("/bus-attendance")}
            className="w-full h-12 bg-apple-blue hover:bg-blue-600 text-white rounded-xl"
          >
            Go to Bus Attendance
          </Button>
        </div>
      </div>
    );
  }

  // Show driver login screen
  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-gray-50 p-6">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 mb-6">
              <BusIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-apple-gray-800">
              Bus Device
            </h1>
            <p className="mt-2 text-apple-gray-500">
              {busInfo?.name ? `Bus: ${busInfo.name}` : "Select driver to continue"}
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-apple-xl shadow-apple-card p-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="driver-select" className="text-sm font-medium text-apple-gray-700 block mb-2">
                  Select Driver
                </label>
                <select
                  id="driver-select"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full h-12 px-4 border border-apple-gray-200 rounded-xl bg-white text-apple-gray-800 focus:border-apple-orange focus:ring-2 focus:ring-orange-500/20 transition-all"
                >
                  <option value="">-- Select a driver --</option>
                  {drivers.map((driver) => (
                    <option key={driver} value={driver}>
                      {driver}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleDriverLogin}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium"
                disabled={!selectedDriver}
              >
                Login to Bus Device
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/bus-attendance")}
                className="w-full h-12 rounded-xl border-apple-gray-200 text-apple-gray-600 hover:bg-apple-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div >
    );
  }

  return (
    <div className="min-h-screen bg-apple-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-apple-xl shadow-apple-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-apple-gray-800">Bus Device</h1>
              <p className="text-sm text-apple-gray-500 mt-1">
                {busInfo?.name && driverName && (
                  <>Bus: {busInfo.name} · Driver: {driverName}</>
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

        {/* Bus Route Info */}
        {busInfo && (
          <div className="bg-white rounded-apple-xl shadow-apple-card p-6 border-l-4 border-orange-500">
            <h2 className="text-lg font-semibold text-apple-gray-800 mb-4">Bus Information</h2>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <BusIcon className="h-5 w-5 text-apple-gray-400" />
                <span className="font-medium text-apple-gray-800">{busInfo.name}</span>
                <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                  {busInfo.route_code}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-apple-gray-400" />
                <span className="text-apple-gray-600">Driver: {busInfo.driver_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-apple-gray-400" />
                <span className="text-apple-gray-600">{busInfo.driver_phone}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-apple-gray-400" />
                  <span className="text-apple-gray-600">Departure: {busInfo.departure_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-apple-gray-400" />
                  <span className="text-apple-gray-600">Return: {busInfo.return_time}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner */}
        <div className="space-y-4">
          {!isScanning ? (
            <Button
              onClick={() => setIsScanning(true)}
              size="lg"
              className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-base"
            >
              Start Boarding Attendance
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
