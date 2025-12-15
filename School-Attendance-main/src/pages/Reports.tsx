
import { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  FileDown,
  Filter,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Bus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { dataService } from "@/services/dataService";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";

// Define the weekday data type
interface WeekdayData {
  [key: string]: {
    present: number;
    absent: number;
  };
}

// Define the type for hourly data
interface HourlyData {
  time: string;
  count: number;
}

// Define type for classroom attendance
interface ClassroomAttendance {
  grade: string;
  section: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

// Define type for bus attendance
interface BusAttendance {
  route: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

export default function Reports() {
  const [dateRange, setDateRange] = useState("this_week");
  const [attendanceOverview, setAttendanceOverview] = useState({
    present: 0,
    absent: 0,
    total: 0,
    presentPercent: 0,
    absentPercent: 0,
    trend: "0%"
  });

  const [classroomAttendance, setClassroomAttendance] = useState<ClassroomAttendance[]>([]);
  const [busAttendance, setBusAttendance] = useState<BusAttendance[]>([]);
  const [weekdayData, setWeekdayData] = useState<WeekdayData>({});
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [pieChartData, setPieChartData] = useState<{ name: string; value: number }[]>([]);

  // Colors for the pie chart
  const COLORS = ['#4CAF50', '#F44336', '#FFC107'];

  useEffect(() => {
    // Get attendance data
    const attendanceData = dataService.getAttendanceData();

    // Calculate overall attendance stats
    if (attendanceData.length > 0) {
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;

      attendanceData.forEach(day => {
        totalPresent += day.present;
        totalAbsent += day.absent;
        totalLate += day.late || 0;
      });

      const total = totalPresent + totalAbsent + totalLate;
      const presentPercent = total > 0 ? parseFloat(((totalPresent / total) * 100).toFixed(1)) : 0;
      const absentPercent = total > 0 ? parseFloat(((totalAbsent / total) * 100).toFixed(1)) : 0;
      const latePercent = total > 0 ? parseFloat(((totalLate / total) * 100).toFixed(1)) : 0;

      // Calculate trend
      let trendValue = "0%";
      if (attendanceData.length >= 2) {
        const latest = attendanceData[attendanceData.length - 1];
        const previous = attendanceData[attendanceData.length - 2];

        const latestRate = latest.present / (latest.present + latest.absent + (latest.late || 0));
        const previousRate = previous.present / (previous.present + previous.absent + (previous.late || 0));

        trendValue = `${((latestRate - previousRate) * 100).toFixed(1)}%`;
        if (latestRate > previousRate) {
          trendValue = "+" + trendValue;
        }
      }

      setAttendanceOverview({
        present: totalPresent,
        absent: totalAbsent,
        total,
        presentPercent,
        absentPercent,
        trend: trendValue
      });

      // Set data for pie chart
      setPieChartData([
        { name: 'Present', value: totalPresent },
        { name: 'Absent', value: totalAbsent },
        { name: 'Late', value: totalLate }
      ]);
    }

    // Get real classroom attendance data based on actual students
    const classes = dataService.getClasses();
    const students = dataService.getStudents();

    const classroomData = classes.map(cls => {
      const grade = cls.name.split(" - ")[0];
      const section = cls.name.split(" - ")[1];

      // Count students in this grade-section combination
      const classStudents = students.filter(student =>
        student.grade === grade && student.section === section && student.status === "active"
      );

      const total = classStudents.length;
      // For now, show 100% attendance (no absences) since we don't have attendance tracking yet
      // In the future, this would query actual attendance records
      const absent = 0;
      const present = total - absent;
      const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;

      return {
        grade,
        section,
        present,
        absent,
        total,
        percentage
      };
    }).filter(cls => cls.total > 0); // Only show classes that have students

    setClassroomAttendance(classroomData);


    // Get real bus attendance data based on actual students assigned to routes
    const busRoutes = dataService.getBusRoutes();


    const busData = busRoutes.map(route => {
      // Count students assigned to this bus route
      const routeStudents = students.filter(student =>
        student.busRoute === route.id && student.status === "active"
      );

      const total = routeStudents.length;
      // For now, show 100% attendance (no absences) since we don't have attendance tracking yet
      // In the future, this would query actual attendance records
      const absent = 0;
      const present = total - absent;
      const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;

      return {
        route: route.name,
        present,
        absent,
        total,
        percentage
      };
    }).filter(bus => bus.total > 0); // Only show bus routes that have students

    setBusAttendance(busData);


    // Generate weekday data
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const mockWeekdayData: WeekdayData = {};

    weekdays.forEach((day, index) => {
      const present = 96 - (index * 2.3); // Gradually decreasing attendance through the week
      mockWeekdayData[day] = {
        present: parseFloat(present.toFixed(1)),
        absent: parseFloat((100 - present).toFixed(1))
      };
    });
    setWeekdayData(mockWeekdayData);

    // Generate hourly data
    const hours = [
      '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'
    ];

    const mockHourlyData = hours.map(time => {
      let count;
      if (time === '8:00 AM' || time === '3:00 PM') {
        count = Math.floor(Math.random() * 100) + 300; // Peak hours
      } else {
        count = Math.floor(Math.random() * 50) + 10; // Regular hours
      }

      return { time, count };
    });
    setHourlyData(mockHourlyData);

  }, [dateRange]); // Refresh when date range changes

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Attendance analytics and reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="blue-outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="blue-outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="blue">
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Attendance Overview</CardTitle>
              <Select defaultValue={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              {dateRange === "today" ? "Today's" :
                dateRange === "yesterday" ? "Yesterday's" :
                  dateRange === "this_week" ? "This week's" :
                    dateRange === "last_week" ? "Last week's" :
                      dateRange === "this_month" ? "This month's" : "Custom"} attendance statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">Present Students</div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{attendanceOverview.present}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className={attendanceOverview.trend.startsWith('+') ? 'text-green-600' : attendanceOverview.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'}>
                    {attendanceOverview.trend}
                  </span>
                  <span>from previous period</span>
                </div>
                <div className="text-sm font-medium">{attendanceOverview.presentPercent}% of total</div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">Absent Students</div>
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{attendanceOverview.absent}</div>
                <div className="text-sm text-muted-foreground">Total absences recorded</div>
                <div className="text-sm font-medium">{attendanceOverview.absentPercent}% of total</div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">Total Enrollment</div>
                  <div className="h-8 w-8 rounded-full bg-school-light flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-school-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{attendanceOverview.total}</div>
                <div className="text-sm text-muted-foreground">Registered students</div>
                <div className="text-sm font-medium">
                  <div className="h-2 bg-gray-200 rounded-full mt-1 mb-1">
                    <div
                      className="h-2 bg-school-primary rounded-full"
                      style={{ width: `${attendanceOverview.presentPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Present</span>
                    <span>Absent</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <h4 className="text-sm font-medium mb-2">Attendance Distribution</h4>
                <div className="h-[160px]">
                  {pieChartData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Detail</CardTitle>
            <CardDescription>
              Breakdown by class and bus route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="classroom">
              <TabsList className="mb-4">
                <TabsTrigger value="classroom">Classroom Attendance</TabsTrigger>
                <TabsTrigger value="bus">Bus Attendance</TabsTrigger>
              </TabsList>

              <TabsContent value="classroom" className="space-y-4">
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-5">Class</div>
                    <div className="col-span-2 text-right">Present</div>
                    <div className="col-span-2 text-right">Absent</div>
                    <div className="col-span-3 text-right">Rate</div>
                  </div>

                  {classroomAttendance.map((cls, index) => (
                    <div
                      key={`${cls.grade}-${cls.section}`}
                      className={`grid grid-cols-12 px-4 py-3 text-sm ${index !== classroomAttendance.length - 1 ? "border-b" : ""
                        }`}
                    >
                      <div className="col-span-5">
                        <span className="font-medium">{cls.grade} - {cls.section}</span>
                      </div>
                      <div className="col-span-2 text-right text-green-600 font-medium">
                        {cls.present}
                      </div>
                      <div className="col-span-2 text-right text-red-600 font-medium">
                        {cls.absent}
                      </div>
                      <div className="col-span-3 text-right">
                        <Badge className={`font-medium ${cls.percentage >= 95 ? "bg-green-100 text-green-800" :
                          cls.percentage >= 90 ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                          {cls.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="bus" className="space-y-4">
                <div className="rounded-lg border">
                  <div className="grid grid-cols-12 bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-5">Bus Route</div>
                    <div className="col-span-2 text-right">Present</div>
                    <div className="col-span-2 text-right">Absent</div>
                    <div className="col-span-3 text-right">Rate</div>
                  </div>

                  {busAttendance.map((bus, index) => (
                    <div
                      key={bus.route}
                      className={`grid grid-cols-12 px-4 py-3 text-sm ${index !== busAttendance.length - 1 ? "border-b" : ""
                        }`}
                    >
                      <div className="col-span-5">
                        <span className="font-medium">{bus.route}</span>
                      </div>
                      <div className="col-span-2 text-right text-green-600 font-medium">
                        {bus.present}
                      </div>
                      <div className="col-span-2 text-right text-red-600 font-medium">
                        {bus.absent}
                      </div>
                      <div className="col-span-3 text-right">
                        <Badge className={`font-medium ${bus.percentage >= 95 ? "bg-green-100 text-green-800" :
                          bus.percentage >= 90 ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                          {bus.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="blue-outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter Results
            </Button>
            <Button variant="blue-outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Analysis by day and time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-3">Attendance by Day of Week</h4>
              <div className="space-y-3">
                {Object.entries(weekdayData).map(([day, data]) => (
                  <div key={day} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{day}</span>
                      <span className="font-medium">{data.present}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${data.present >= 95 ? "bg-green-500" :
                          data.present >= 90 ? "bg-amber-500" :
                            "bg-red-500"
                          }`}
                        style={{ width: `${data.present}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-3">Hourly Check-in Distribution</h4>
              <div className="h-40 flex items-end justify-between gap-1">
                {hourlyData.map((item) => {
                  // Calculate percentage height (max is 100%)
                  const maxCount = Math.max(...hourlyData.map(h => h.count));
                  const heightPercent = (item.count / maxCount) * 100;

                  return (
                    <div key={item.time} className="flex flex-col items-center">
                      <div
                        className={`w-7 rounded-t ${item.time.includes("8:00 AM") || item.time.includes("3:00 PM")
                          ? "bg-school-primary"
                          : "bg-school-light"
                          }`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      <div className="text-xs mt-1 text-muted-foreground">
                        {item.time.split(" ")[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 bg-school-primary rounded"></div>
                  <span>Peak Hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 bg-school-light rounded"></div>
                  <span>Regular Hours</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Generate Custom Reports</CardTitle>
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Report Settings
            </Button>
          </div>
          <CardDescription>
            Create detailed reports for specific time periods and classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select defaultValue="attendance">
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance Summary</SelectItem>
                  <SelectItem value="detail">Detailed Attendance</SelectItem>
                  <SelectItem value="absent">Absence Report</SelectItem>
                  <SelectItem value="bus">Bus Attendance</SelectItem>
                  <SelectItem value="comparison">Comparison Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="blue-outline">
            <PieChart className="mr-2 h-4 w-4" />
            Preview Report
          </Button>
          <Button variant="blue">
            <FileDown className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
