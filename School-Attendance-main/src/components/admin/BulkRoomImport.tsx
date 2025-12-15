import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";

interface RoomCSVRow {
  name: string;
  building?: string;
  floor?: string;
  capacity?: string;
}

export function BulkRoomImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = [
      ["name", "building", "floor", "capacity"],
      ["Room 101", "Main Building", "1", "30"],
      ["Room 102", "Main Building", "1", "35"],
      ["Lab A", "Science Block", "2", "25"],
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rooms_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Fill in the template and upload it to import rooms",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    setIsImporting(true);

    Papa.parse<RoomCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log('CSV parsed successfully. Rows:', results.data.length);
        console.log('Sample data:', results.data.slice(0, 2));
        
        try {
          const rooms = results.data
            .filter((row) => row.name && row.name.trim() !== "")
            .map((row) => ({
              name: row.name.trim(),
              building: row.building?.trim() || null,
              floor: row.floor ? parseInt(row.floor) : null,
              capacity: row.capacity ? parseInt(row.capacity) : null,
            }));

          console.log('Filtered rooms:', rooms.length);
          console.log('Rooms to insert:', rooms);

          if (rooms.length === 0) {
            console.error('No valid rooms found in CSV');
            toast({
              title: "Error",
              description: "No valid rooms found in CSV file. Make sure the 'name' column has values.",
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }

          // Validate data
          const errors: string[] = [];
          rooms.forEach((room, index) => {
            if (room.name.length > 50) {
              errors.push(`Row ${index + 2}: Room name too long (max 50 characters)`);
            }
            if (room.building && room.building.length > 50) {
              errors.push(`Row ${index + 2}: Building name too long (max 50 characters)`);
            }
            if (room.floor !== null && (isNaN(room.floor) || room.floor < -10 || room.floor > 100)) {
              errors.push(`Row ${index + 2}: Floor must be a number between -10 and 100`);
            }
            if (room.capacity !== null && (isNaN(room.capacity) || room.capacity < 1 || room.capacity > 1000)) {
              errors.push(`Row ${index + 2}: Capacity must be a number between 1 and 1000`);
            }
          });

          if (errors.length > 0) {
            console.error('Validation errors:', errors);
            toast({
              title: "Validation Errors",
              description: errors.slice(0, 3).join("; ") + (errors.length > 3 ? "..." : ""),
              variant: "destructive",
            });
            setIsImporting(false);
            return;
          }

          console.log('Inserting rooms into database...');
          
          let successCount = 0;
          let duplicateCount = 0;
          let updatedCount = 0;
          let errorCount = 0;
          
          for (const room of rooms) {
            if (updateExisting) {
              // Try to update first, then insert if doesn't exist
              const { data: existing } = await supabase
                .from("rooms")
                .select("id")
                .eq("name", room.name)
                .maybeSingle();
              
              if (existing) {
                const { error } = await supabase
                  .from("rooms")
                  .update(room)
                  .eq("id", existing.id);
                
                if (error) {
                  errorCount++;
                  console.error(`Error updating room ${room.name}:`, error);
                } else {
                  updatedCount++;
                  console.log(`Updated room: ${room.name}`);
                }
              } else {
                const { error } = await supabase.from("rooms").insert([room]);
                if (error) {
                  errorCount++;
                  console.error(`Error inserting room ${room.name}:`, error);
                } else {
                  successCount++;
                  console.log(`Added new room: ${room.name}`);
                }
              }
            } else {
              // Just try to insert
              const { error } = await supabase.from("rooms").insert([room]);
              
              if (error) {
                if (error.message.includes("duplicate") || error.code === "23505") {
                  duplicateCount++;
                  console.log(`Skipped duplicate room: ${room.name}`);
                } else {
                  errorCount++;
                  console.error(`Error inserting room ${room.name}:`, error);
                }
              } else {
                successCount++;
              }
            }
          }

          console.log(`Import complete: ${successCount} added, ${updatedCount} updated, ${duplicateCount} duplicates skipped, ${errorCount} errors`);
          
          if (successCount > 0 || updatedCount > 0 || duplicateCount > 0) {
            const messages = [];
            if (successCount > 0) messages.push(`${successCount} room(s) added`);
            if (updatedCount > 0) messages.push(`${updatedCount} room(s) updated`);
            if (duplicateCount > 0) messages.push(`${duplicateCount} duplicate(s) skipped`);
            
            toast({
              title: "Import Complete",
              description: messages.join(", "),
            });
          }
          
          if (errorCount > 0) {
            toast({
              title: "Import Warning",
              description: `${errorCount} room(s) failed to import. Check console for details.`,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error processing CSV:", error);
          toast({
            title: "Error",
            description: `Failed to process CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        toast({
          title: "Error",
          description: `Failed to parse CSV file: ${error.message}`,
          variant: "destructive",
        });
        setIsImporting(false);
      },
    });
  };

  return (
    <Card>
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Room Import
        </CardTitle>
        <CardDescription>Import multiple rooms from a CSV file</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <input
              type="checkbox"
              id="updateExisting"
              checked={updateExisting}
              onChange={(e) => setUpdateExisting(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="updateExisting" className="text-sm font-medium cursor-pointer">
              Update existing rooms (if room name matches)
            </label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={downloadTemplate} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button
              variant="blue"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? "Importing..." : "Upload CSV"}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">CSV Format Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <strong>name</strong> (required): Room name (max 50 characters)
              </li>
              <li>
                <strong>building</strong> (optional): Building name (max 50 characters)
              </li>
              <li>
                <strong>floor</strong> (optional): Floor number (-10 to 100)
              </li>
              <li>
                <strong>capacity</strong> (optional): Room capacity (1 to 1000)
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
