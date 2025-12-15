import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AttendanceOverview } from "@/components/dashboard/reports/AttendanceOverview";
import { ClassroomAttendanceReport } from "@/components/dashboard/reports/ClassroomAttendanceReport";
import { BusAttendanceReport } from "@/components/dashboard/reports/BusAttendanceReport";
import { WeekdayPattern } from "@/components/dashboard/reports/WeekdayPattern";
import { HourlyCheckins } from "@/components/dashboard/reports/HourlyCheckins";
import { useDashboardData } from "@/hooks/useDashboardData";
import { loadDashboardConfig, type DashboardConfig } from "@/components/dashboard/DashboardConfig";

export default function Dashboard() {
  const [config, setConfig] = useState<DashboardConfig>(loadDashboardConfig());
  const { 
    stats, 
    attendanceData, 
    recentActivities,
    attendanceOverview,
    classroomAttendance,
    busAttendance,
    weekdayData,
    hourlyData
  } = useDashboardData();

  return (
    <div className="space-y-6">
      <DashboardHeader onConfigChange={setConfig} />
      
      {config.statsCards && <DashboardStats stats={stats} />}

      <div className="grid gap-4 md:grid-cols-2">
        {config.attendanceChart && <AttendanceChart data={attendanceData} />}
        {config.recentActivities && <RecentActivities activities={recentActivities} />}
      </div>
      
      {config.quickActions && <QuickActions />}
      
      {config.attendanceOverview && <AttendanceOverview data={attendanceOverview} />}
      
      <div className="grid gap-4 md:grid-cols-2">
        {config.classroomAttendance && <ClassroomAttendanceReport data={classroomAttendance} />}
        {config.busAttendance && <BusAttendanceReport data={busAttendance} />}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {config.weekdayPattern && <WeekdayPattern data={weekdayData} />}
        {config.hourlyCheckins && <HourlyCheckins data={hourlyData} />}
      </div>
    </div>
  );
}
