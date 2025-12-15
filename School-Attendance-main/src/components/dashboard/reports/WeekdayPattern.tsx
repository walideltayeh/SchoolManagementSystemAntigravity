import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface WeekdayPatternProps {
  data: {
    day: string;
    present: number;
    absent: number;
  }[];
}

export function WeekdayPattern({ data }: WeekdayPatternProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekday Attendance Pattern</CardTitle>
        <CardDescription>Attendance patterns across the week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" name="Present %" fill="#22c55e" />
              <Bar dataKey="absent" name="Absent %" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
