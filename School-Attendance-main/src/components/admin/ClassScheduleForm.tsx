
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { dataService } from "@/services/dataService";
import { Loader2 } from "lucide-react";
import { Save, Calendar } from "lucide-react";
import { ClassSchedule } from "@/services/dataService";
import { supabase } from "@/integrations/supabase/client";

interface ClassScheduleFormProps {
  onSubmit: (schedule: any) => void;
  editingSchedule?: ClassSchedule | null;
  onCancelEdit?: () => void;
  teachers?: any[];
  classes?: any[];
}

export function ClassScheduleForm({ onSubmit, editingSchedule = null, onCancelEdit, teachers = [], classes = [] }: ClassScheduleFormProps) {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Monday"]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1");
  const [weekSchedule, setWeekSchedule] = useState<number[]>([1]);
  const [applyToAllWeeks, setApplyToAllWeeks] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [suggestedRooms, setSuggestedRooms] = useState<string[]>([]);
  const [bookedRoomIds, setBookedRoomIds] = useState<Set<string>>(new Set());
  const [classEnrollmentCount, setClassEnrollmentCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter classes by selected teacher's assigned classes
  const availableClasses = selectedTeacher ? classes.filter(c =>
    c.teacher_id === selectedTeacher
  ) : [];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const weeks = [1, 2, 3, 4];
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Load periods and rooms from database
  useEffect(() => {
    loadPeriods();
    loadRooms();

    // Subscribe to real-time updates
    const periodsChannel = supabase
      .channel('periods-changes-schedule')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'periods'
        },
        () => {
          console.log('Periods changed, reloading in schedule form...');
          loadPeriods();
        }
      )
      .subscribe();

    const roomsChannel = supabase
      .channel('rooms-changes-schedule')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        () => {
          console.log('Rooms changed, reloading in schedule form...');
          loadRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(periodsChannel);
      supabase.removeChannel(roomsChannel);
    };
  }, []);

  const loadPeriods = async () => {
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .order('period_number', { ascending: true });

    if (error) {
      console.error('Error loading periods:', error);
      return;
    }

    setAvailablePeriods(data || []);
  };

  const loadRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading rooms:', error);
      return;
    }

    setAvailableRooms(data || []);
  };

  // Initialize form with editing values if provided
  useEffect(() => {
    if (editingSchedule) {
      setSelectedTeacher(editingSchedule.teacherId);
      setSelectedClass(editingSchedule.className);
      setSelectedRoom(editingSchedule.roomId);
      setSelectedDays([editingSchedule.day]);
      setSelectedPeriod(String(editingSchedule.period));
      setWeekSchedule([editingSchedule.week]);
      setApplyToAllWeeks(false);
      // Set month if available
      if (editingSchedule.month) {
        setSelectedMonths([editingSchedule.month]);
      }
    }
  }, [editingSchedule]);

  // Clear class selection when teacher changes
  useEffect(() => {
    setSelectedClass("");
  }, [selectedTeacher]);

  // Load enrollment count when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadClassEnrollment();
    }
  }, [selectedClass]);

  // Generate room suggestions when scheduling criteria are selected (no need for teacher/class)
  useEffect(() => {
    if (selectedDays.length > 0 && selectedPeriod && weekSchedule.length > 0 && availableRooms.length > 0) {
      generateRoomSuggestions();
    } else {
      // Clear suggestions if conditions aren't met
      setSuggestedRooms([]);
      setBookedRoomIds(new Set());
    }
  }, [selectedDays, selectedPeriod, weekSchedule, availableRooms, classEnrollmentCount, selectedClass]);

  const loadClassEnrollment = async () => {
    try {
      const { count, error } = await supabase
        .from('class_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', selectedClass);

      if (error) throw error;
      setClassEnrollmentCount(count || 0);
    } catch (error) {
      console.error('Error loading enrollment:', error);
    }
  };

  const generateRoomSuggestions = async () => {
    try {
      const suggestions: string[] = [];

      console.log('🔍 Checking room availability with:', {
        selectedPeriod,
        selectedDays,
        weekSchedule,
        availableRoomsCount: availableRooms.length
      });

      // Fetch all conflicting schedules in one query
      // Join with periods table to filter by period_number instead of period_id
      const { data: conflicts, error } = await supabase
        .from('class_schedules')
        .select('room_id, day, week_number, period_id, periods!inner(period_number)')
        .eq('periods.period_number', parseInt(selectedPeriod))
        .in('day', selectedDays as Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>)
        .in('week_number', weekSchedule);

      console.log('📊 Query results:', { conflictsFound: conflicts?.length || 0, conflicts, error });

      if (error) {
        console.error('Error checking conflicts:', error);
        return;
      }

      // Create a set of conflicting room IDs for quick lookup
      const conflictingRoomIds = new Set<string>();


      if (conflicts) {
        for (const conflict of conflicts) {
          // Check if this conflict matches any of our selected days and weeks
          if (selectedDays.includes(conflict.day) && weekSchedule.includes(conflict.week_number)) {
            conflictingRoomIds.add(conflict.room_id);
            console.log('🚫 Room conflict detected:', { roomId: conflict.room_id, day: conflict.day, week: conflict.week_number, period: conflict.period_id });
          }
        }
      }

      console.log('✅ Booked room IDs:', Array.from(conflictingRoomIds));

      // Store booked room IDs for display
      setBookedRoomIds(conflictingRoomIds);

      // Filter available rooms based on conflicts and capacity
      for (const room of availableRooms) {
        // Skip if room has conflicts
        if (conflictingRoomIds.has(room.id)) {
          continue;
        }

        // Check if room has sufficient capacity
        if (!room.capacity || room.capacity >= classEnrollmentCount) {
          suggestions.push(room.id);
        }
      }

      setSuggestedRooms(suggestions);
    } catch (error) {
      console.error('Error generating room suggestions:', error);
    }
  };

  const handleWeekChange = (week: number) => {
    if (applyToAllWeeks) {
      setWeekSchedule([1, 2, 3, 4]);
    } else {
      setWeekSchedule(prev =>
        prev.includes(week)
          ? prev.filter(w => w !== week)
          : [...prev, week]
      );
    }
  };

  useEffect(() => {
    if (applyToAllWeeks) {
      setWeekSchedule([1, 2, 3, 4]);
    } else if (editingSchedule) {
      setWeekSchedule([editingSchedule.week]);
    } else {
      setWeekSchedule([1]);
    }
  }, [applyToAllWeeks, editingSchedule]);

  const checkForConflicts = async (schedule: any): Promise<boolean> => {
    // Check against database schedules for conflicts
    const { data: existingSchedules, error } = await supabase
      .from('class_schedules')
      .select('*, classes(name, grade, section, subject), teachers:class_id(teachers(full_name)), rooms:room_id(name)')
      .eq('day', schedule.day)
      .eq('period_id', selectedPeriod)
      .eq('week_number', schedule.week);

    if (error) {
      console.error('Error checking conflicts:', error);
      return false;
    }

    // Filter out the schedule we're currently editing
    const filteredSchedules = editingSchedule
      ? existingSchedules?.filter(s => s.id !== editingSchedule.id)
      : existingSchedules;

    if (!filteredSchedules || filteredSchedules.length === 0) {
      return false;
    }

    // Check for teacher conflicts (same teacher, same day, period, week)
    const teacherConflict = filteredSchedules.some((s: any) =>
      s.class_id === schedule.classId
    );

    if (teacherConflict) {
      const conflictingClass = filteredSchedules.find((s: any) => s.class_id === schedule.classId);
      toast({
        title: "Schedule Conflict",
        description: `Teacher ${schedule.teacherName} is already scheduled at this time`,
        variant: "destructive",
      });
      return true;
    }

    // Check for room conflicts (same room, same day, period, week)
    const roomConflict = filteredSchedules.some((s: any) =>
      s.room_id === schedule.roomId
    );

    if (roomConflict) {
      const conflictingSchedule = filteredSchedules.find((s: any) => s.room_id === schedule.roomId);
      const roomName = conflictingSchedule?.rooms?.name || schedule.roomName;
      const conflictingClassName = conflictingSchedule?.classes?.name || 'another class';
      toast({
        title: "Room Double-Booking Detected",
        description: `Room ${roomName} is already booked for ${conflictingClassName} at this time`,
        variant: "destructive",
      });
      return true;
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Auto-select all months if none selected
    const monthsToUse = selectedMonths.length === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : selectedMonths;

    // Detailed validation with specific error messages
    if (!selectedTeacher) {
      toast({
        title: "Error",
        description: "Please select a teacher",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!selectedClass) {
      toast({
        title: "Error",
        description: availableClasses.length === 0
          ? "Selected teacher has no assigned classes. Please assign classes to this teacher first."
          : "Please select a class",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (availablePeriods.length === 0) {
      toast({
        title: "Error",
        description: "No periods configured. Please add periods in the Periods section first.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!selectedPeriod) {
      toast({
        title: "Error",
        description: "Please select a period",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (availableRooms.length === 0) {
      toast({
        title: "Error",
        description: "No rooms configured. Please add rooms in the Rooms section first.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!selectedRoom) {
      toast({
        title: "Error",
        description: "Please select a room",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (selectedDays.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one day",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (weekSchedule.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one week",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const teacher = teachers.find(t => t.id === selectedTeacher);
    const selectedClassObj = availableClasses.find(c => c.id === selectedClass);
    const selectedRoomObj = availableRooms.find(r => r.id === selectedRoom);

    if (!teacher || !selectedClassObj || !selectedRoomObj) {
      toast({
        title: "Error",
        description: "Invalid selection - please try again",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Create schedules for all selected day, week, and month combinations
    const schedules = [];
    for (const day of selectedDays) {
      for (const week of weekSchedule) {
        for (const month of monthsToUse) {
          schedules.push({
            teacherId: teacher.id,
            teacherName: teacher.full_name || teacher.name,
            classId: selectedClass,
            className: `${selectedClassObj.name} (${selectedClassObj.subject})`,
            roomId: selectedRoom,
            roomName: selectedRoomObj.name,
            day: day,
            period: parseInt(selectedPeriod),
            week: week,
            month: month
          });
        }
      }
    }

    // Check each schedule for conflicts
    for (const schedule of schedules) {
      const hasConflict = await checkForConflicts(schedule);
      if (hasConflict) {
        setIsSubmitting(false);
        return;
      }
    }

    // If we have an editing schedule, clear form after submitting
    const isEditing = !!editingSchedule;

    schedules.forEach(schedule => {
      onSubmit(schedule);
    });

    if (!isEditing) {
      // Reset form
      setSelectedTeacher("");
      setSelectedClass("");
      setSelectedRoom("");
      setSelectedDays(["Monday"]);
      setSelectedPeriod("1");
      setSelectedMonths([]);
      if (!applyToAllWeeks) {
        setWeekSchedule([1]);
      }
    } else if (onCancelEdit) {
      onCancelEdit();
    }

    toast({
      title: isEditing ? "Schedule Updated" : "Schedule Created",
      description: `Schedule has been ${isEditing ? 'updated' : 'added'} for ${schedules.length} entries`,
    });

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="teacher">Teacher</Label>
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger id="teacher">
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.full_name || teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Select
            value={selectedClass}
            onValueChange={setSelectedClass}
            disabled={!selectedTeacher || availableClasses.length === 0}
          >
            <SelectTrigger id="class">
              <SelectValue placeholder={!selectedTeacher ? "Select a teacher first" : availableClasses.length === 0 ? "No classes assigned to this teacher" : "Select class"} />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No classes assigned to this teacher.<br />
                  Assign classes in the Classes tab first.
                </div>
              ) : (
                availableClasses.map((classObj) => (
                  <SelectItem key={classObj.id} value={classObj.id}>
                    {classObj.name} ({classObj.subject})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="room">Room</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={availableRooms.length === 0}>
            <SelectTrigger id="room">
              <SelectValue placeholder={availableRooms.length === 0 ? "No rooms configured" : "Select room"} />
            </SelectTrigger>
            <SelectContent>
              {availableRooms.map((room) => {
                const isBooked = bookedRoomIds.has(room.id);
                const isFree = !isBooked;
                const enrollmentFits = !room.capacity || room.capacity >= classEnrollmentCount;

                return (
                  <SelectItem key={room.id} value={room.id} disabled={isBooked}>
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className={isBooked ? "text-muted-foreground" : ""}>
                        {room.name}
                        {room.building && ` - ${room.building}`}
                        {room.capacity && ` (Cap: ${room.capacity})`}
                      </span>
                      <div className="flex gap-1">
                        {isBooked && (
                          <Badge variant="destructive" className="ml-2">
                            Booked
                          </Badge>
                        )}
                        {isFree && (
                          <Badge variant="default" className="ml-2 bg-green-500">
                            Free
                          </Badge>
                        )}
                        {!enrollmentFits && classEnrollmentCount > 0 && isFree && (
                          <Badge variant="outline" className="ml-2 text-xs border-orange-500 text-orange-500">
                            Too Small
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {classEnrollmentCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {classEnrollmentCount} student{classEnrollmentCount !== 1 ? 's' : ''} enrolled • {suggestedRooms.length} room{suggestedRooms.length !== 1 ? 's' : ''} suggested
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="day">Days (select multiple)</Label>
          <div className="border rounded-md p-3 space-y-2">
            {days.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={selectedDays.includes(day)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedDays([...selectedDays, day]);
                    } else {
                      setSelectedDays(selectedDays.filter(d => d !== day));
                    }
                  }}
                  disabled={!!editingSchedule}
                />
                <Label htmlFor={`day-${day}`} className="cursor-pointer font-normal">
                  {day}
                </Label>
              </div>
            ))}
          </div>
          {selectedDays.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Period</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={availablePeriods.length === 0}>
            <SelectTrigger id="period">
              <SelectValue placeholder={availablePeriods.length === 0 ? "No periods configured" : "Select period"} />
            </SelectTrigger>
            <SelectContent>
              {availablePeriods.map((period) => (
                <SelectItem key={period.period_number} value={String(period.period_number)}>
                  Period {period.period_number} ({period.start_time} - {period.end_time})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 border-2 border-primary/20 rounded-lg p-4 bg-accent/5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-primary" />
          <Label className="text-base font-semibold text-primary">Month Selection (Required)</Label>
        </div>

        <div className="border rounded-md p-3 space-y-2">
          {months.map((month) => (
            <div key={month.value} className="flex items-center space-x-2">
              <Checkbox
                id={`month-${month.value}`}
                checked={selectedMonths.includes(month.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedMonths([...selectedMonths, month.value]);
                  } else {
                    setSelectedMonths(selectedMonths.filter(m => m !== month.value));
                  }
                }}
                disabled={!!editingSchedule}
              />
              <Label htmlFor={`month-${month.value}`} className="cursor-pointer font-normal">
                {month.label}
              </Label>
            </div>
          ))}
        </div>
        {selectedMonths.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedMonths.length} month{selectedMonths.length !== 1 ? 's' : ''} selected: {selectedMonths.map(m => months.find(mo => mo.value === m)?.label).join(", ")}
          </p>
        )}
      </div>

      <div className="space-y-3 border-2 border-primary/20 rounded-lg p-4 bg-accent/5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-primary" />
          <Label className="text-base font-semibold text-primary">Week Selection</Label>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="applyToAll"
            checked={applyToAllWeeks}
            onCheckedChange={(checked) => setApplyToAllWeeks(checked === true)}
            disabled={!!editingSchedule}
          />
          <Label htmlFor="applyToAll" className="font-medium">
            Apply to all weeks (Weeks 1, 2, 3, 4)
          </Label>
        </div>

        {!applyToAllWeeks && (
          <div className="space-y-2">
            <Label className="block mb-2 text-sm font-medium">Select specific week(s):</Label>
            <div className="flex flex-wrap gap-2">
              {weeks.map((week) => (
                <Button
                  key={week}
                  type="button"
                  variant={weekSchedule.includes(week) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleWeekChange(week)}
                  className={weekSchedule.includes(week) ? "bg-primary" : ""}
                  disabled={!!editingSchedule}
                >
                  Week {week}
                </Button>
              ))}
            </div>
            {weekSchedule.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {weekSchedule.length} week{weekSchedule.length !== 1 ? 's' : ''} selected: Week {weekSchedule.sort().join(', Week ')}
              </p>
            )}
          </div>
        )}
        {applyToAllWeeks && (
          <p className="text-sm text-muted-foreground">
            Schedule will be created for all 4 weeks
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {editingSchedule && onCancelEdit && (
          <Button type="button" variant="outline" className="w-full" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="blue" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {editingSchedule ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {editingSchedule ? "Update" : "Add"} Schedule
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
