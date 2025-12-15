import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClassAttendance {
  grade: string;
  section: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

interface ClassroomAttendanceReportProps {
  data: ClassAttendance[];
}

export function ClassroomAttendanceReport({ data }: ClassroomAttendanceReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Classroom Attendance</CardTitle>
        <CardDescription>Attendance breakdown by class</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <div className="grid grid-cols-12 bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
            <div className="col-span-5">Class</div>
            <div className="col-span-2 text-right">Present</div>
            <div className="col-span-2 text-right">Absent</div>
            <div className="col-span-3 text-right">Rate</div>
          </div>
          
          {data.map((cls, index) => (
            <div 
              key={`${cls.grade}-${cls.section}`} 
              className={`grid grid-cols-12 px-4 py-3 text-sm ${
                index !== data.length - 1 ? "border-b" : ""
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
                <Badge className={`font-medium ${
                  cls.percentage >= 95 ? "bg-green-100 text-green-800" :
                  cls.percentage >= 90 ? "bg-amber-100 text-amber-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {cls.percentage}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
