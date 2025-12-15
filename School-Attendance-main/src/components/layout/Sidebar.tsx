
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  BarChart, 
  BookOpen,
  Bus,
  Home, 
  Settings, 
  Users,
  QrCode,
  Bell,
  ShieldAlert,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSchoolConfig } from "@/hooks/useSchoolConfig";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { schoolInfo } = useSchoolConfig();
  
  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-2 px-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
            end
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/students" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
          >
            <Users className="h-5 w-5" />
            <span>Students</span>
          </NavLink>
          <NavLink 
            to="/teachers" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
          >
            <BookOpen className="h-5 w-5" />
            <span>Teachers</span>
          </NavLink>
          <NavLink 
            to="/attendance" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
          >
            <QrCode className="h-5 w-5" />
            <span>Attendance</span>
          </NavLink>
          <NavLink 
            to="/calendar" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
          >
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </NavLink>
          <NavLink 
            to="/reports" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
          >
            <BarChart className="h-5 w-5" />
            <span>Reports</span>
          </NavLink>
          <NavLink 
            to="/transport" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
          >
            <Bus className="h-5 w-5" />
            <span>Transport</span>
          </NavLink>
          <NavLink 
            to="/notifications" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </NavLink>
          <NavLink 
            to="/parent-portal" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
          >
            <Users className="h-5 w-5" />
            <span>Parent Portal</span>
          </NavLink>
          <NavLink 
            to="/admin" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
          >
            <ShieldAlert className="h-5 w-5" />
            <span>Admin</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/85 hover:text-primary-foreground",
                isActive ? "bg-muted text-foreground" : ""
              )
            }
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t">
        <div className="p-4 flex flex-col items-center gap-3">
          <img 
            src={schoolInfo.logo} 
            alt={`${schoolInfo.name} Logo`}
            className="h-16 w-16 object-contain"
          />
          <div className="text-xs text-muted-foreground text-center">
            <p className="font-medium">{schoolInfo.name}</p>
            <p>Version {schoolInfo.version}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
