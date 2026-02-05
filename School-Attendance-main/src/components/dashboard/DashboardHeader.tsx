import { Link } from "react-router-dom";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardConfig as DashboardConfigComponent, type DashboardConfig } from "./DashboardConfig";

interface DashboardHeaderProps {
  onConfigChange: (config: DashboardConfig) => void;
}

export function DashboardHeader({ onConfigChange }: DashboardHeaderProps) {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-apple-gray-800 tracking-tight">
          Dashboard
        </h1>
        <p className="text-apple-gray-500 mt-1">
          {dateString}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <DashboardConfigComponent onConfigChange={onConfigChange} />
        <Link to="/attendance">
          <Button className="bg-apple-blue hover:bg-blue-600 text-white rounded-xl px-5 h-11 font-medium shadow-sm transition-all hover:shadow-md">
            <QrCode className="mr-2 h-4 w-4" />
            Scan Attendance
          </Button>
        </Link>
      </div>
    </div>
  );
}
