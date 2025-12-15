
import { Link } from "react-router-dom";
import { Users, QrCode, BarChart3, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/students/register">
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Register Student
            </Button>
          </Link>
          <Link to="/attendance">
            <Button variant="outline" className="w-full justify-start">
              <QrCode className="mr-2 h-4 w-4" />
              Take Attendance
            </Button>
          </Link>
          <Link to="/reports">
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" className="w-full justify-start">
              <School className="mr-2 h-4 w-4" />
              School Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
