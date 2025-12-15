import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Period {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
}

interface ClassSchedule {
  id: string;
  day: string;
  period_id: string;
  class_id: string;
  classes: {
    name: string;
    grade: string;
    section: string;
    subject: string;
    teacher_id: string | null;
    teachers: {
      full_name: string;
    } | null;
  };
  rooms: {
    id: string;
    name: string;
    building: string | null;
    floor: number | null;
  } | null;
}

interface RoomScheduleEntry {
  period: Period;
  monday?: ClassSchedule;
  tuesday?: ClassSchedule;
  wednesday?: ClassSchedule;
  thursday?: ClassSchedule;
  friday?: ClassSchedule;
}

export function RoomScheduleView() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [roomSchedules, setRoomSchedules] = useState<Map<string, RoomScheduleEntry[]>>(new Map());
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [rooms, setRooms] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (periods.length > 0 && schedules.length > 0) {
      organizeSchedulesByRoom();
    }
  }, [periods, schedules]);

  const loadData = async () => {
    try {
      // Load periods
      const { data: periodsData, error: periodsError } = await supabase
        .from('periods')
        .select('*')
        .order('period_number', { ascending: true });

      if (periodsError) throw periodsError;

      // Load class schedules with class details and room information
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('class_schedules')
        .select(`
          *,
          classes (
            name,
            grade,
            section,
            subject,
            teacher_id,
            teachers (
              full_name
            )
          ),
          rooms:room_id (
            id,
            name,
            building,
            floor
          )
        `);

      if (schedulesError) throw schedulesError;

      setPeriods(periodsData || []);
      setSchedules(schedulesData || []);

      // Extract unique rooms from the rooms relation
      const uniqueRooms = new Set<string>();
      schedulesData?.forEach((schedule: any) => {
        if (schedule.rooms?.name) {
          uniqueRooms.add(schedule.rooms.name);
        }
      });
      setRooms(Array.from(uniqueRooms).sort());
    } catch (error) {
      console.error('Error loading schedule data:', error);
      toast({
        title: "Error",
        description: "Failed to load schedule data",
        variant: "destructive",
      });
    }
  };

  const organizeSchedulesByRoom = () => {
    const roomMap = new Map<string, RoomScheduleEntry[]>();

    // Get all unique rooms from schedules
    const roomsSet = new Set<string>();
    schedules.forEach((schedule) => {
      if (schedule.rooms?.name) {
        roomsSet.add(schedule.rooms.name);
      }
    });

    roomsSet.forEach((room) => {
      const roomSchedule: RoomScheduleEntry[] = periods.map((period) => ({
        period,
      }));

      // Fill in the schedule for each day
      schedules.forEach((schedule) => {
        if (schedule.rooms?.name === room) {
          const periodIndex = periods.findIndex((p) => p.id === schedule.period_id);
          if (periodIndex !== -1) {
            const day = schedule.day.toLowerCase() as keyof Omit<RoomScheduleEntry, 'period'>;
            roomSchedule[periodIndex][day] = schedule;
          }
        }
      });

      roomMap.set(room, roomSchedule);
    });

    setRoomSchedules(roomMap);
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Format HH:MM
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getScheduleForRoom = (): [string, RoomScheduleEntry[]][] => {
    if (selectedRoom === "all") {
      return Array.from(roomSchedules.entries());
    }
    const schedule = roomSchedules.get(selectedRoom);
    return schedule ? [[selectedRoom, schedule]] : [];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Room Schedule
              </CardTitle>
              <CardDescription>View room occupancy across periods and days</CardDescription>
            </div>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="all">All Rooms</option>
              {rooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {periods.length === 0 ? (
            <p className="text-center text-muted-foreground">No periods configured yet</p>
          ) : getScheduleForRoom().length === 0 ? (
            <p className="text-center text-muted-foreground">No schedules found for selected room</p>
          ) : (
            <div className="space-y-8">
              {getScheduleForRoom().map(([room, schedule]) => (
                <div key={room} className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">
                    Room: {room}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="border p-3 text-left font-semibold">Period</th>
                          <th className="border p-3 text-left font-semibold">Time</th>
                          {days.map((day) => (
                            <th key={day} className="border p-3 text-center font-semibold min-w-[150px]">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((entry) => (
                          <tr key={entry.period.id} className="hover:bg-accent/50">
                            <td className="border p-3 font-medium">
                              Period {entry.period.period_number}
                            </td>
                            <td className="border p-3 text-sm text-muted-foreground whitespace-nowrap">
                              {formatTime(entry.period.start_time)} - {formatTime(entry.period.end_time)}
                            </td>
                            {days.map((day) => {
                              const dayKey = day.toLowerCase() as keyof Omit<RoomScheduleEntry, 'period'>;
                              const classSchedule = entry[dayKey];
                              
                              return (
                                <td key={day} className="border p-2">
                                  {classSchedule ? (
                                    <div className="space-y-1">
                                      <Badge variant="secondary" className="text-xs font-normal">
                                        {classSchedule.classes.grade} - Sec {classSchedule.classes.section}
                                      </Badge>
                                      <p className="text-xs font-medium">{classSchedule.classes.subject}</p>
                                      {classSchedule.classes.teachers?.full_name && (
                                        <p className="text-xs text-muted-foreground">
                                          {classSchedule.classes.teachers.full_name}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground text-center">Free</p>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
