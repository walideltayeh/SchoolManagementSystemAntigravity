import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link2, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuickRoomAssignmentProps {
  room: {
    id: string;
    name: string;
    capacity?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickRoomAssignment({ room, isOpen, onClose, onSuccess }: QuickRoomAssignmentProps) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [enrollmentCount, setEnrollmentCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const weeks = [1, 2, 3, 4];

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedClass) {
      loadEnrollment();
    }
  }, [selectedClass]);

  const loadData = async () => {
    try {
      // Load classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('grade', { ascending: true });

      // Load teachers
      const { data: teachersData } = await supabase
        .from('teachers')
        .select('id, full_name')
        .order('full_name', { ascending: true });

      // Load periods
      const { data: periodsData } = await supabase
        .from('periods')
        .select('*')
        .order('period_number', { ascending: true });

      setClasses(classesData || []);
      setTeachers(teachersData || []);
      setPeriods(periodsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load form data",
        variant: "destructive",
      });
    }
  };

  const loadEnrollment = async () => {
    try {
      const { count } = await supabase
        .from('class_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', selectedClass);

      setEnrollmentCount(count || 0);
    } catch (error) {
      console.error('Error loading enrollment:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedTeacher || !selectedDay || !selectedPeriod || !selectedWeek) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if room capacity is sufficient
    if (room.capacity && enrollmentCount > room.capacity) {
      toast({
        title: "Capacity Warning",
        description: `Room capacity (${room.capacity}) is less than enrolled students (${enrollmentCount}). Continue anyway?`,
        variant: "destructive",
      });
      // Allow user to proceed if they want
    }

    setIsSubmitting(true);

    try {
      // Check for conflicts
      const { data: existingSchedule } = await supabase
        .from('class_schedules')
        .select('id')
        .eq('room_id', room.id)
        .eq('day', selectedDay as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')
        .eq('period_id', selectedPeriod)
        .eq('week_number', parseInt(selectedWeek))
        .maybeSingle();

      if (existingSchedule) {
        toast({
          title: "Room Already Booked",
          description: "This room is already assigned for this time slot",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create the schedule entry
      const { error } = await supabase
        .from('class_schedules')
        .insert({
          class_id: selectedClass,
          room_id: room.id,
          day: selectedDay as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday',
          period_id: selectedPeriod,
          week_number: parseInt(selectedWeek)
        });

      if (error) throw error;

      toast({
        title: "Schedule Created",
        description: `${room.name} assigned successfully`,
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClass("");
    setSelectedTeacher("");
    setSelectedDay("Monday");
    setSelectedPeriod("");
    setSelectedWeek("1");
    setEnrollmentCount(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const capacityWarning = room.capacity && enrollmentCount > 0 && enrollmentCount > room.capacity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Quick Assign: {room.name}
          </DialogTitle>
          <DialogDescription>
            Create a schedule entry linking this room to a class and time slot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quick-teacher">Teacher *</Label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger id="quick-teacher">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-class">Class *</Label>
            <Select 
              value={selectedClass} 
              onValueChange={setSelectedClass}
              disabled={!selectedTeacher}
            >
              <SelectTrigger id="quick-class">
                <SelectValue placeholder={!selectedTeacher ? "Select teacher first" : "Select class"} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.grade} - Section {cls.section} ({cls.subject})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {enrollmentCount > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">
                  {enrollmentCount} student{enrollmentCount !== 1 ? 's' : ''} enrolled
                </span>
                {capacityWarning && (
                  <Badge variant="destructive" className="text-xs">
                    Exceeds capacity ({room.capacity})
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quick-day">Day *</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger id="quick-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-week">Week *</Label>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger id="quick-week">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-period">Period *</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger id="quick-period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-3 w-3" />
                      Period {period.period_number} ({period.start_time} - {period.end_time})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="blue" 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedClass || !selectedTeacher || !selectedPeriod}
          >
            {isSubmitting ? "Creating..." : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
