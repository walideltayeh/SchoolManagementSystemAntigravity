import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { Upload, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClassRow {
  grade: string;
  section: string;
  subject: string;
}

export function BulkClassImport({ onImportComplete }: { onImportComplete: () => void }) {
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadTemplate = () => {
    const csv = "grade,section,subject\nKG1,A,Mathematics\nKG1,B,English";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "class_import_template.csv";
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
        const data = results.data as ClassRow[];
        
        // Validate data
        const errors: string[] = [];
        const validClasses: ClassRow[] = [];

        data.forEach((row, index) => {
          if (!row.grade || !row.section || !row.subject) {
            errors.push(`Row ${index + 2}: Missing required fields`);
          } else {
            validClasses.push(row);
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

        // Insert classes in bulk
        try {
          const classesToInsert = validClasses.map(row => ({
            name: `${row.grade} - ${row.section} - ${row.subject}`,
            grade: row.grade,
            section: row.section,
            subject: row.subject,
            teacher_id: null,
          }));

          const { error } = await supabase
            .from("classes")
            .insert(classesToInsert);

          if (error) throw error;

          toast({
            title: "Success",
            description: `Successfully imported ${validClasses.length} classes`,
          });

          onImportComplete();
          event.target.value = "";
        } catch (error) {
          console.error("Error importing classes:", error);
          toast({
            title: "Import Failed",
            description: "Failed to import classes. Please try again.",
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
        <Label>Bulk Import Classes from CSV</Label>
        <p className="text-sm text-muted-foreground">
          Upload a CSV file with columns: grade, section, subject (rooms assigned in schedules)
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

        <Label htmlFor="csv-upload" className="cursor-pointer">
          <Button
            type="button"
            variant="blue"
            disabled={isImporting}
            className="gap-2"
            asChild
          >
            <span>
              <Upload className="h-4 w-4" />
              {isImporting ? "Importing..." : "Upload CSV"}
            </span>
          </Button>
          <Input
            id="csv-upload"
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
