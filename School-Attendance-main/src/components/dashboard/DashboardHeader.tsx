import { Link } from "react-router-dom";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardConfig as DashboardConfigComponent, type DashboardConfig } from "./DashboardConfig";

interface DashboardHeaderProps {
  onConfigChange: (config: DashboardConfig) => void;
}

export function DashboardHeader({ onConfigChange }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the School Scan Connect Dashboard.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DashboardConfigComponent onConfigChange={onConfigChange} />
        <Link to="/attendance">
          <Button className="bg-school-primary hover:bg-school-secondary">
            <QrCode className="mr-2 h-4 w-4" />
            Scan Attendance
          </Button>
        </Link>
      </div>
    </div>
  );
}
