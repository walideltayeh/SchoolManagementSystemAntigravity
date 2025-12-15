import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Download, Printer, Users } from "lucide-react";
import QRCode from "react-qr-code";
import { getAvailableGrades, getAvailableSections } from "@/utils/classHelpers";

interface Student {
  id: string;
  full_name: string;
  student_code: string;
  grade: string;
  section: string;
  qr_code: string;
}

export function BulkQRGenerator() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);

  useEffect(() => {
    loadStudents();
    loadAvailableGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade !== "all") {
      loadAvailableSections(selectedGrade);
    } else {
      setAvailableSections([]);
      setSelectedSection("all");
    }
  }, [selectedGrade]);

  useEffect(() => {
    filterStudents();
  }, [selectedGrade, selectedSection, students]);

  const loadAvailableGrades = async () => {
    const grades = await getAvailableGrades();
    setAvailableGrades(grades);
  };

  const loadAvailableSections = async (grade: string) => {
    const sections = await getAvailableSections(grade);
    setAvailableSections(sections);
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, student_code, grade, section, qr_code")
        .order("grade")
        .order("section")
        .order("full_name");

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (selectedGrade !== "all") {
      filtered = filtered.filter(s => s.grade === selectedGrade);
    }

    if (selectedSection !== "all") {
      filtered = filtered.filter(s => s.section === selectedSection);
    }

    setFilteredStudents(filtered);
  };

  const handlePrintAll = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow pop-ups to print QR codes",
        variant: "destructive",
      });
      return;
    }

    const qrCodesHTML = filteredStudents.map((student, index) => {
      const qrElement = document.getElementById(`qr-${student.id}`);
      return `
        <div class="qr-card" style="break-inside: avoid; page-break-inside: avoid; margin-bottom: 20px; border: 2px solid #333; padding: 15px; border-radius: 8px;">
          <div style="text-align: center;">
            <h3 style="margin: 0 0 5px 0; font-size: 18px;">${student.full_name}</h3>
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
              ${student.student_code} | Grade ${student.grade} - Section ${student.section}
            </p>
            <div style="display: flex; justify-content: center; margin: 15px 0;">
              ${qrElement?.outerHTML || ''}
            </div>
            <p style="margin: 10px 0 0 0; color: #888; font-size: 12px;">Scan for Attendance</p>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Student QR Codes - Bulk Print</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .qr-card {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            @media screen and (max-width: 768px) {
              .qr-grid {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Student QR Codes</h1>
            <p>Total: ${filteredStudents.length} students</p>
            ${selectedGrade !== "all" ? `<p>Grade: ${selectedGrade}</p>` : ''}
            ${selectedSection !== "all" ? `<p>Section: ${selectedSection}</p>` : ''}
          </div>
          <div class="qr-grid">
            ${qrCodesHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Small delay to ensure content is rendered before printing
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadAll = () => {
    toast({
      title: "Coming Soon",
      description: "PDF download feature will be available soon. Please use the print function.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk QR Code Generator
        </CardTitle>
        <CardDescription>
          Generate and print QR codes for all students or filter by grade/section
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by Grade</label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {availableGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by Section</label>
            <Select
              value={selectedSection}
              onValueChange={setSelectedSection}
              disabled={selectedGrade === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedGrade === "all" ? "Select a grade first" : "All Sections"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {availableSections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Filtered Students</p>
            <p className="text-2xl font-bold">{filteredStudents.length}</p>
          </div>
          <Badge variant="outline">
            {selectedGrade !== "all" && selectedGrade}
            {selectedGrade !== "all" && selectedSection !== "all" && " - "}
            {selectedSection !== "all" && selectedSection}
            {selectedGrade === "all" && selectedSection === "all" && "All Students"}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handlePrintAll} disabled={filteredStudents.length === 0} className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print All ({filteredStudents.length})
          </Button>
          <Button onClick={handleDownloadAll} disabled={filteredStudents.length === 0} variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Hidden QR Codes for Printing */}
        <div style={{ display: "none" }}>
          {filteredStudents.map((student) => (
            <div key={student.id}>
              <QRCode
                id={`qr-${student.id}`}
                value={student.qr_code}
                size={200}
                level="H"
              />
            </div>
          ))}
        </div>

        {/* Preview Grid */}
        {filteredStudents.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Preview ({filteredStudents.slice(0, 6).length} of {filteredStudents.length})</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredStudents.slice(0, 6).map((student) => (
                <div key={student.id} className="border rounded-lg p-3 text-center">
                  <p className="font-medium text-sm truncate">{student.full_name}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {student.student_code}
                  </p>
                  <div className="flex justify-center">
                    <QRCode value={student.qr_code} size={80} level="H" />
                  </div>
                </div>
              ))}
            </div>
            {filteredStudents.length > 6 && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                + {filteredStudents.length - 6} more students
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
