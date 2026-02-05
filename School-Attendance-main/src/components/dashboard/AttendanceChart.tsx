import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface AttendanceChartProps {
  data: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <div className="bg-white rounded-apple-xl shadow-apple-card p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-apple-gray-800">Attendance Overview</h2>
        <p className="text-sm text-apple-gray-500">Last 5 days attendance records</p>
      </div>
      {data.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#86868b', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#86868b', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar dataKey="present" name="Present" fill="#34c759" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="#ff3b30" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" name="Late" fill="#ff9500" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-apple-gray-400">No attendance data available</p>
        </div>
      )}
    </div>
  );
}
