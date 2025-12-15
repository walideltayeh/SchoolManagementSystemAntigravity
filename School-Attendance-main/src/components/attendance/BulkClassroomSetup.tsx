import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { Upload, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClassroomRow {
  grade: string;
  section: string;
  subject: string;
}

export function BulkClassroomSetup({ onSetupComplete }: { onSetupComplete: () => void }) {
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadTemplate = () => {
    const csv = "grade,section,subject\nKG1,A,Mathematics\nKG1,B,English\nGrade 1,A,Science";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "classroom_setup_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as ClassroomRow[];
        
        // Validate data
        const errors: string[] = [];
        const validClassrooms: ClassroomRow[] = [];

        data.forEach((row, index) => {
          if (!row.grade || !row.section || !row.subject) {
            errors.push(`Row ${index + 2}: Missing required fields`);
          } else {
            validClassrooms.push(row);
          }
        });

        if (errors.length > 0) {
          toast({
            title: "Validation Errors",
            description: `Found ${errors.length} errors. First error: ${errors[0]}`,
            variant: "destructive",
          });
          setIsImporting(false);
          return;
        }

        // Verify classrooms exist in database
        try {
          const classroomChecks = await Promise.all(
            validClassrooms.map(async (classroom) => {
              const { data, error } = await supabase
                .from("classes")
                .select("id, name")
                .eq("grade", classroom.grade)
                .eq("section", classroom.section)
                .eq("subject", classroom.subject)
                .single();

              if (error || !data) {
                return {
                  success: false,
                  classroom: `${classroom.grade} - ${classroom.section} - ${classroom.subject}`,
                };
              }

              return { success: true, data };
            })
          );

          const failures = classroomChecks.filter((check) => !check.success);
          
          if (failures.length > 0) {
            toast({
              title: "Classrooms Not Found",
              description: `${failures.length} classroom(s) not found in database. First: ${failures[0].classroom}`,
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }

          const successCount = classroomChecks.filter((check) => check.success).length;
          
          toast({
            title: "Success",
            description: `Verified ${successCount} classroom(s) for attendance setup`,
          });

          onSetupComplete();
          event.target.value = "";
        } catch (error) {
          console.error("Error verifying classrooms:", error);
          toast({
            title: "Setup Failed",
            description: "Failed to verify classrooms. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        toast({
          title: "Parse Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
        setIsImporting(false);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label>Bulk Classroom Setup from CSV</Label>
        <p className="text-sm text-muted-foreground">
          Upload a CSV file with columns: grade, section, subject
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadTemplate}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>

        <Label htmlFor="classroom-csv-upload" className="cursor-pointer">
          <Button
            type="button"
            disabled={isImporting}
            className="gap-2"
            asChild
          >
            <span>
              <Upload className="h-4 w-4" />
              {isImporting ? "Verifying..." : "Upload CSV"}
            </span>
          </Button>
          <Input
            id="classroom-csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isImporting}
          />
        </Label>
      </div>
    </div>
  );
}
