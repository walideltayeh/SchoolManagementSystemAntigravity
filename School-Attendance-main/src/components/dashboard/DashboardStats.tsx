
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

export function StatCard({ title, value, icon, change, changeType }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${
          changeType === 'positive' ? 'text-green-500' : 
          changeType === 'negative' ? 'text-red-500' : 
          'text-zinc-500'
        }`}>
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: StatCardProps[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}
