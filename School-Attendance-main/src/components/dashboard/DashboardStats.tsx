import { ReactNode } from "react";

export interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

export function StatCard({ title, value, icon, change, changeType }: StatCardProps) {
  return (
    <div className="bg-white rounded-apple-xl p-6 shadow-apple-card hover:shadow-apple-hover transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-apple-gray-500">{title}</span>
        <div className="text-apple-gray-400">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-semibold text-apple-gray-800 tracking-tight">{value}</div>
        <p className={`text-sm font-medium ${changeType === 'positive' ? 'text-apple-green' :
            changeType === 'negative' ? 'text-apple-red' :
              'text-apple-gray-500'
          }`}>
          {change}
        </p>
      </div>
    </div>
  );
}

interface DashboardStatsProps {
  stats: StatCardProps[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}
