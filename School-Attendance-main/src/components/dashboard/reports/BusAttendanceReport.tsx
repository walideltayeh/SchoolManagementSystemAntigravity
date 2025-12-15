import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BusAttendance {
  route: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

interface BusAttendanceReportProps {
  data: BusAttendance[];
}

export function BusAttendanceReport({ data }: BusAttendanceReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bus Attendance</CardTitle>
        <CardDescription>Attendance breakdown by bus route</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <div className="grid grid-cols-12 bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
            <div className="col-span-5">Bus Route</div>
            <div className="col-span-2 text-right">Present</div>
            <div className="col-span-2 text-right">Absent</div>
            <div className="col-span-3 text-right">Rate</div>
          </div>
          
          {data.map((bus, index) => (
            <div 
              key={bus.route} 
              className={`grid grid-cols-12 px-4 py-3 text-sm ${
                index !== data.length - 1 ? "border-b" : ""
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
                <Badge className={`font-medium ${
                  bus.percentage >= 95 ? "bg-green-100 text-green-800" :
                  bus.percentage >= 90 ? "bg-amber-100 text-amber-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {bus.percentage}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
