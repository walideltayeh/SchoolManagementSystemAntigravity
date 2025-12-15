import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function SubjectManagement() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    loadSubjects();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('subjects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subjects'
        },
        () => {
          loadSubjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading subjects:', error);
      return;
    }

    setSubjects(data?.map(s => s.name) || []);
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }

    if (subjects.includes(newSubject.trim())) {
      toast({
        title: "Error",
        description: "Subject already exists",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('subjects')
      .insert({ name: newSubject.trim() });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add subject: " + error.message,
        variant: "destructive",
      });
      return;
    }

    setNewSubject("");
    
    toast({
      title: "Subject Added",
      description: `${newSubject} has been added to the subject list`,
    });
  };

  const handleRemoveSubject = async (subject: string) => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('name', subject);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove subject: " + error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Subject Removed",
      description: `${subject} has been removed`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Management</CardTitle>
        <CardDescription>
          Manage the list of subjects available in your school
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="newSubject">Add New Subject</Label>
          <div className="flex gap-2">
            <Input
              id="newSubject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g., Biology, Chemistry"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
            />
            <Button variant="blue" onClick={handleAddSubject}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        <div>
          <Label className="mb-3 block">Current Subjects ({subjects.length})</Label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Badge key={subject} variant="secondary" className="text-sm py-2 px-3">
                {subject}
                <button
                  onClick={() => handleRemoveSubject(subject)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export async function getAvailableSubjects(): Promise<string[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error loading subjects:', error);
    return [];
  }

  return data?.map(s => s.name) || [];
}
