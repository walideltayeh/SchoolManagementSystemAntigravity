import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";

interface Period {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
}

interface Room {
  id: string;
  name: string;
  building: string | null;
  capacity: number | null;
}

interface RoomOccupancy {
  roomId: string;
  roomName: string;
  periods: {
    [periodId: string]: {
      occupied: boolean;
      className?: string;
      teacherName?: string;
    };
  };
}

export function RoomOccupancyCalendar() {
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [occupancy, setOccupancy] = useState<RoomOccupancy[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const weeks = [1, 2, 3, 4];

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('occupancy-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'class_schedules'
        },
        () => {
          loadOccupancy();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (periods.length > 0 && rooms.length > 0) {
      loadOccupancy();
    }
  }, [selectedDay, selectedWeek, periods, rooms]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load periods
      const { data: periodsData, error: periodsError } = await supabase
        .from('periods')
        .select('*')
        .order('period_number', { ascending: true });

      if (periodsError) throw periodsError;

      // Load rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('name', { ascending: true });

      if (roomsError) throw roomsError;

      setPeriods(periodsData || []);
      setRooms(roomsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOccupancy = async () => {
    try {
      // Load schedules for selected day and week
      const { data: schedulesData, error } = await supabase
        .from('class_schedules')
        .select(`
          *,
          classes (
            name,
            grade,
            section,
            subject,
            teachers (
              full_name
            )
          )
        `)
        .eq('day', selectedDay as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')
        .eq('week_number', selectedWeek);

      if (error) throw error;

      // Build occupancy map
      const occupancyMap: RoomOccupancy[] = rooms.map(room => ({
        roomId: room.id,
        roomName: room.name,
        periods: {}
      }));

      schedulesData?.forEach((schedule: any) => {
        const roomOccupancy = occupancyMap.find(o => o.roomId === schedule.room_id);
        if (roomOccupancy) {
          roomOccupancy.periods[schedule.period_id] = {
            occupied: true,
            className: schedule.classes?.name,
            teacherName: schedule.classes?.teachers?.full_name
          };
        }
      });

      setOccupancy(occupancyMap);
    } catch (error) {
      console.error('Error loading occupancy:', error);
      toast({
        title: "Error",
        description: "Failed to load room occupancy",
        variant: "destructive",
      });
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Format HH:MM
  };

  const getOccupancyStats = () => {
    let totalSlots = 0;
    let occupiedSlots = 0;

    occupancy.forEach(room => {
      periods.forEach(period => {
        totalSlots++;
        if (room.periods[period.id]?.occupied) {
          occupiedSlots++;
        }
      });
    });

    const utilizationRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    return { totalSlots, occupiedSlots, freeSlots: totalSlots - occupiedSlots, utilizationRate };
  };

  const stats = getOccupancyStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Room Occupancy Calendar
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Room Occupancy Calendar
          </CardTitle>
          <CardDescription>
            Visual overview of room availability throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Day:</span>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Week:</span>
              <Select value={selectedWeek.toString()} onValueChange={(v) => setSelectedWeek(parseInt(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map(week => (
                    <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 ml-auto">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Free ({stats.freeSlots})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Occupied ({stats.occupiedSlots})</span>
              </div>
              <Badge variant="outline">
                Utilization: {stats.utilizationRate}%
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium bg-muted/50 sticky left-0 z-10">
                    Room
                  </th>
                  {periods.map(period => (
                    <th key={period.id} className="text-center p-3 font-medium bg-muted/50 min-w-[140px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Period {period.period_number}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(period.start_time)} - {formatTime(period.end_time)}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={periods.length + 1} className="text-center p-8 text-muted-foreground">
                      No rooms available. Create rooms in the Rooms section first.
                    </td>
                  </tr>
                ) : (
                  occupancy.map(room => (
                    <tr key={room.roomId} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium sticky left-0 bg-background">
                        {room.roomName}
                      </td>
                      {periods.map(period => {
                        const slot = room.periods[period.id];
                        const isOccupied = slot?.occupied;

                        return (
                          <td key={period.id} className="p-2 text-center">
                            <div
                              className={`rounded-md p-2 min-h-[60px] flex flex-col justify-center items-center transition-colors ${
                                isOccupied
                                  ? 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800'
                                  : 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800'
                              }`}
                            >
                              {isOccupied ? (
                                <>
                                  <div className="text-xs font-medium line-clamp-1">
                                    {slot.className}
                                  </div>
                                  {slot.teacherName && (
                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                      {slot.teacherName}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                                  Free
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
