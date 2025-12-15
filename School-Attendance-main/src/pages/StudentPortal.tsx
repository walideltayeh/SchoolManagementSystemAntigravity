import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { LogOut, Download, Printer, User } from "lucide-react";
import { StudentQRDisplay } from "@/components/attendance/StudentQRDisplay";

interface StudentData {
  id: string;
  full_name: string;
  student_code: string;
  grade: string;
  section: string;
  qr_code: string;
  photo_url?: string;
}

export default function StudentPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentData | null>(null);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setStudent(data);
    } catch (error) {
      console.error("Error loading student data:", error);
      toast({
        title: "Error",
        description: "Failed to load student information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Student Record Found</CardTitle>
            <CardDescription>
              Please contact your school administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <CardTitle>{student.full_name}</CardTitle>
                <CardDescription>
                  Grade {student.grade} - Section {student.section}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardHeader>
        </Card>

        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student Code:</span>
              <Badge variant="outline">{student.student_code}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grade:</span>
              <span className="font-medium">{student.grade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Section:</span>
              <span className="font-medium">{student.section}</span>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <StudentQRDisplay
          studentName={student.full_name}
          studentCode={student.student_code}
          qrCode={student.qr_code}
          grade={student.grade}
          section={student.section}
        />

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use Your QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. <strong>For Classroom Attendance:</strong> Show this QR code to your teacher when they scan attendance at the beginning of class.</p>
            <p>2. <strong>For Bus Attendance:</strong> Scan the bus QR code when boarding your assigned bus.</p>
            <p>3. <strong>Keep Your QR Code Safe:</strong> You can download or print this QR code to attach to your student ID card.</p>
            <p>4. <strong>Digital Access:</strong> You can always access your QR code by logging into this portal from any device.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
