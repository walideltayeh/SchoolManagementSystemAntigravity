import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleRow {
  teacher_code: string;
  grade: string;
  section: string;
  subject: string;
  room_name: string;
  day: string;
  period_number: string;
  week_numbers: string;
}

export function BulkScheduleImport() {
  const [isImporting, setIsImporting] = useState(false);

  const downloadTemplate = () => {
    const template = [
      {
        teacher_code: "T001",
        grade: "Grade 10",
        section: "A",
        subject: "Mathematics",
        room_name: "Room 101",
        day: "Monday",
        period_number: "1",
        week_numbers: "1,2,3,4"
      },
      {
        teacher_code: "T002",
        grade: "Grade 10",
        section: "A",
        subject: "Physics",
        room_name: "Lab 1",
        day: "Tuesday",
        period_number: "2",
        week_numbers: "1,2"
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Fill in the CSV file with your schedule data",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const scheduleRows = results.data as ScheduleRow[];
          
          if (scheduleRows.length === 0) {
            toast({
              title: "Error",
              description: "CSV file is empty",
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }

          // Validate required columns
          const requiredColumns = ['teacher_code', 'grade', 'section', 'subject', 'room_name', 'day', 'period_number', 'week_numbers'];
          const firstRow = scheduleRows[0];
          const missingColumns = requiredColumns.filter(col => !(col in firstRow));
          
          if (missingColumns.length > 0) {
            toast({
              title: "Invalid CSV Format",
              description: `Missing columns: ${missingColumns.join(', ')}`,
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }

          await processSchedules(scheduleRows);
        } catch (error) {
          console.error("Error processing CSV:", error);
          toast({
            title: "Import Failed",
            description: error instanceof Error ? error.message : "Failed to process CSV file",
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
          event.target.value = "";
        }
      },
      error: (error) => {
        console.error("CSV parse error:", error);
        toast({
          title: "Parse Error",
          description: "Failed to parse CSV file",
          variant: "destructive",
        });
        setIsImporting(false);
        event.target.value = "";
      },
    });
  };

  const processSchedules = async (rows: ScheduleRow[]) => {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const schedulesToInsert = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 for header and 0-index

      // Validate day
      if (!validDays.includes(row.day)) {
        errors.push(`Row ${rowNum}: Invalid day "${row.day}". Must be one of: ${validDays.join(', ')}`);
        continue;
      }

      // Parse week numbers
      const weekNumbers = row.week_numbers.split(',').map(w => parseInt(w.trim())).filter(w => w >= 1 && w <= 4);
      if (weekNumbers.length === 0) {
        errors.push(`Row ${rowNum}: Invalid week_numbers "${row.week_numbers}". Must be comma-separated numbers 1-4`);
        continue;
      }

      // Find teacher
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('teacher_code', row.teacher_code.trim())
        .maybeSingle();

      if (teacherError || !teacher) {
        errors.push(`Row ${rowNum}: Teacher with code "${row.teacher_code}" not found`);
        continue;
      }

      // Find class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('grade', row.grade.trim())
        .eq('section', row.section.trim())
        .eq('subject', row.subject.trim())
        .maybeSingle();

      if (classError || !classData) {
        errors.push(`Row ${rowNum}: Class not found (${row.grade} - Section ${row.section}, ${row.subject})`);
        continue;
      }

      // Update class with teacher
      await supabase
        .from('classes')
        .update({ teacher_id: teacher.id })
        .eq('id', classData.id);

      // Find room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('name', row.room_name.trim())
        .maybeSingle();

      if (roomError || !room) {
        errors.push(`Row ${rowNum}: Room "${row.room_name}" not found`);
        continue;
      }

      // Find period
      const { data: period, error: periodError } = await supabase
        .from('periods')
        .select('id')
        .eq('period_number', parseInt(row.period_number))
        .maybeSingle();

      if (periodError || !period) {
        errors.push(`Row ${rowNum}: Period ${row.period_number} not found`);
        continue;
      }

      // Create schedule for each week
      for (const weekNum of weekNumbers) {
        // Check for conflicts
        const { data: conflicts } = await supabase
          .from('class_schedules')
          .select('id')
          .eq('room_id', room.id)
          .eq('day', row.day as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')
          .eq('period_id', period.id)
          .eq('week_number', weekNum);

        if (conflicts && conflicts.length > 0) {
          errors.push(`Row ${rowNum}: Room ${row.room_name} already booked for ${row.day}, Period ${row.period_number}, Week ${weekNum}`);
          continue;
        }

        schedulesToInsert.push({
          class_id: classData.id,
          period_id: period.id,
          room_id: room.id,
          day: row.day,
          week_number: weekNum
        });
      }
    }

    // Show errors if any
    if (errors.length > 0) {
      const errorMessage = errors.slice(0, 5).join('\n');
      const moreErrors = errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : '';
      
      toast({
        title: "Import Errors",
        description: errorMessage + moreErrors,
        variant: "destructive",
      });
    }

    // Insert valid schedules
    if (schedulesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('class_schedules')
        .insert(schedulesToInsert);

      if (insertError) {
        console.error("Error inserting schedules:", insertError);
        toast({
          title: "Insert Failed",
          description: "Failed to create schedules: " + insertError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Import Successful",
        description: `Created ${schedulesToInsert.length} schedule${schedulesToInsert.length !== 1 ? 's' : ''}${errors.length > 0 ? ` with ${errors.length} error${errors.length !== 1 ? 's' : ''}` : ''}`,
      });
    } else if (errors.length > 0) {
      toast({
        title: "Import Failed",
        description: "No valid schedules to import",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Bulk Schedule Import</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Upload a CSV file to create multiple class schedules at once. Download the template to see the required format.
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={downloadTemplate}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>

        <Label htmlFor="schedule-csv-upload" className="flex-1">
          <Button
            type="button"
            variant="blue"
            className="w-full"
            disabled={isImporting}
            asChild
          >
            <span>
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? "Importing..." : "Upload CSV"}
            </span>
          </Button>
          <Input
            id="schedule-csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isImporting}
          />
        </Label>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">CSV Format Requirements:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>teacher_code: Teacher's unique code (e.g., T001)</li>
          <li>grade: Grade level (e.g., Grade 10)</li>
          <li>section: Section letter (e.g., A)</li>
          <li>subject: Subject name (must match existing class)</li>
          <li>room_name: Room name (must exist in system)</li>
          <li>day: Day of week (Monday-Friday)</li>
          <li>period_number: Period number (must exist in system)</li>
          <li>week_numbers: Comma-separated weeks (e.g., 1,2,3,4)</li>
        </ul>
      </div>
    </div>
  );
}
