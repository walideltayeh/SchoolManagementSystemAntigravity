import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, UserCheck } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";

interface AttendanceOverviewProps {
  data: {
    present: number;
    absent: number;
    late: number;
    total: number;
    presentPercent: number;
    absentPercent: number;
    trend: string;
  };
}

const COLORS = ['#4CAF50', '#F44336', '#FFC107'];

export function AttendanceOverview({ data }: AttendanceOverviewProps) {
  const pieChartData = [
    { name: 'Present', value: data.present },
    { name: 'Absent', value: data.absent },
    { name: 'Late', value: data.late }
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>Comprehensive attendance statistics</CardDescription>
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
            <div className="text-3xl font-bold">{data.present}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <span className={data.trend.startsWith('+') ? 'text-green-600' : data.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'}>
                {data.trend}
              </span>
              <span>from previous period</span>
            </div>
            <div className="text-sm font-medium">{data.presentPercent}% of total</div>
          </div>
          
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">Absent Students</div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-bold">{data.absent}</div>
            <div className="text-sm text-muted-foreground">Total absences recorded</div>
            <div className="text-sm font-medium">{data.absentPercent}% of total</div>
          </div>
          
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">Total Enrollment</div>
              <div className="h-8 w-8 rounded-full bg-school-light flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-school-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold">{data.total}</div>
            <div className="text-sm text-muted-foreground">Registered students</div>
            <div className="text-sm font-medium">
              <div className="h-2 bg-gray-200 rounded-full mt-1 mb-1">
                <div 
                  className="h-2 bg-school-primary rounded-full" 
                  style={{ width: `${data.presentPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs">
                <span>Present</span>
                <span>Absent</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border p-4 space-y-1">
            <h4 className="text-sm font-medium mb-2">Distribution</h4>
            <div className="h-[160px]">
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
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
