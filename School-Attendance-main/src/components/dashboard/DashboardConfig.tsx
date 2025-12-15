import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export interface DashboardConfig {
  statsCards: boolean;
  attendanceChart: boolean;
  recentActivities: boolean;
  quickActions: boolean;
  attendanceOverview: boolean;
  classroomAttendance: boolean;
  busAttendance: boolean;
  weekdayPattern: boolean;
  hourlyCheckins: boolean;
}

const DEFAULT_CONFIG: DashboardConfig = {
  statsCards: true,
  attendanceChart: true,
  recentActivities: true,
  quickActions: true,
  attendanceOverview: false,
  classroomAttendance: false,
  busAttendance: false,
  weekdayPattern: false,
  hourlyCheckins: false,
};

const STORAGE_KEY = "dashboard-config";

export function DashboardConfig({ onConfigChange }: { onConfigChange: (config: DashboardConfig) => void }) {
  const [config, setConfig] = useState<DashboardConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onConfigChange(config);
  }, [config, onConfigChange]);

  const handleToggle = (key: keyof DashboardConfig) => {
    const newConfig = { ...config, [key]: !config[key] };
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
    toast.success("Dashboard reset to default configuration");
  };

  const handleApply = () => {
    toast.success("Dashboard configuration applied");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Customize Dashboard
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Dashboard Configuration</SheetTitle>
          <SheetDescription>
            Select which reports and widgets to display on your dashboard
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Quick Overview</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="statsCards"
                checked={config.statsCards}
                onCheckedChange={() => handleToggle("statsCards")}
              />
              <Label htmlFor="statsCards" className="cursor-pointer">
                Statistics Cards
                <p className="text-xs text-muted-foreground">Total students, attendance, bus routes, teachers</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attendanceChart"
                checked={config.attendanceChart}
                onCheckedChange={() => handleToggle("attendanceChart")}
              />
              <Label htmlFor="attendanceChart" className="cursor-pointer">
                Attendance Chart
                <p className="text-xs text-muted-foreground">5-day attendance trend visualization</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recentActivities"
                checked={config.recentActivities}
                onCheckedChange={() => handleToggle("recentActivities")}
              />
              <Label htmlFor="recentActivities" className="cursor-pointer">
                Recent Activities
                <p className="text-xs text-muted-foreground">Latest check-ins and notifications</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="quickActions"
                checked={config.quickActions}
                onCheckedChange={() => handleToggle("quickActions")}
              />
              <Label htmlFor="quickActions" className="cursor-pointer">
                Quick Actions
                <p className="text-xs text-muted-foreground">Shortcuts to common tasks</p>
              </Label>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Detailed Reports</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attendanceOverview"
                checked={config.attendanceOverview}
                onCheckedChange={() => handleToggle("attendanceOverview")}
              />
              <Label htmlFor="attendanceOverview" className="cursor-pointer">
                Attendance Overview
                <p className="text-xs text-muted-foreground">Present/absent statistics with pie chart</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="classroomAttendance"
                checked={config.classroomAttendance}
                onCheckedChange={() => handleToggle("classroomAttendance")}
              />
              <Label htmlFor="classroomAttendance" className="cursor-pointer">
                Classroom Attendance
                <p className="text-xs text-muted-foreground">Attendance breakdown by class</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="busAttendance"
                checked={config.busAttendance}
                onCheckedChange={() => handleToggle("busAttendance")}
              />
              <Label htmlFor="busAttendance" className="cursor-pointer">
                Bus Attendance
                <p className="text-xs text-muted-foreground">Attendance breakdown by bus route</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weekdayPattern"
                checked={config.weekdayPattern}
                onCheckedChange={() => handleToggle("weekdayPattern")}
              />
              <Label htmlFor="weekdayPattern" className="cursor-pointer">
                Weekday Pattern
                <p className="text-xs text-muted-foreground">Attendance patterns across the week</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hourlyCheckins"
                checked={config.hourlyCheckins}
                onCheckedChange={() => handleToggle("hourlyCheckins")}
              />
              <Label htmlFor="hourlyCheckins" className="cursor-pointer">
                Hourly Check-ins
                <p className="text-xs text-muted-foreground">Check-in activity by hour</p>
              </Label>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-2">
            <Button onClick={handleApply} className="flex-1">
              Apply Changes
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function loadDashboardConfig(): DashboardConfig {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
}
