import { Clock } from "lucide-react";

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
    <div className="bg-white rounded-apple-xl shadow-apple-card p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-apple-gray-800">Recent Activity</h2>
        <p className="text-sm text-apple-gray-500">Latest check-ins and notifications</p>
      </div>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-apple-gray-50 hover:bg-apple-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-apple-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-apple-gray-800 truncate">
                  {activity.description}
                </p>
                <p className="text-sm text-apple-gray-500">
                  {activity.user}
                </p>
              </div>
              <div className="flex-shrink-0 text-sm text-apple-gray-400">
                {activity.time}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-apple-gray-400">No recent activities</p>
          </div>
        )}
      </div>
    </div>
  );
}
