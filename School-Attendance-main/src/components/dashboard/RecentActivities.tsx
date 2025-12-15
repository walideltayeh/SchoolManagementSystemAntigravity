
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface Activity {
  id: number;
  type: string;
  description: string;
  time: string;
  user: string;
}

export interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest check-ins and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.user}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {activity.time}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">No recent activities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
