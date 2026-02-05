import { Link } from "react-router-dom";
import { Users, QrCode, BarChart3, School, ChevronRight } from "lucide-react";

interface QuickActionProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

function QuickActionCard({ to, icon, label, description }: QuickActionProps) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-apple-xl p-5 shadow-apple-card hover:shadow-apple-hover transition-all duration-300 flex items-center gap-4"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-apple-gray-100 flex items-center justify-center text-apple-gray-600 group-hover:bg-apple-blue group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-apple-gray-800 group-hover:text-apple-blue transition-colors">
          {label}
        </h3>
        <p className="text-sm text-apple-gray-500 truncate">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-apple-gray-300 group-hover:text-apple-blue group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

export function QuickActions() {
  const actions: QuickActionProps[] = [
    {
      to: "/students/register",
      icon: <Users className="w-5 h-5" />,
      label: "Register Student",
      description: "Add new student"
    },
    {
      to: "/attendance",
      icon: <QrCode className="w-5 h-5" />,
      label: "Take Attendance",
      description: "Scan QR codes"
    },
    {
      to: "/reports",
      icon: <BarChart3 className="w-5 h-5" />,
      label: "View Reports",
      description: "Analytics & insights"
    },
    {
      to: "/settings",
      icon: <School className="w-5 h-5" />,
      label: "School Profile",
      description: "Manage settings"
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-apple-gray-800">Quick Actions</h2>
        <p className="text-sm text-apple-gray-500">Common tasks and operations</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action, i) => (
          <QuickActionCard key={i} {...action} />
        ))}
      </div>
    </div>
  );
}
