import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import Teachers from "@/pages/Teachers";
import TeacherProfile from "@/pages/TeacherProfile";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import StudentRegister from "@/pages/StudentRegister";
import Transport from "@/pages/Transport";
import Notifications from "@/pages/Notifications";
import Attendance from "@/pages/Attendance";
import NotFound from "@/pages/NotFound";
import ClassroomLogin from "@/pages/ClassroomLogin";
import Calendar from "@/pages/Calendar";
import Auth from "@/pages/Auth";
import StudentPortal from "@/pages/StudentPortal";
import BusAttendance from "@/pages/BusAttendance";
import BusLogin from "@/pages/BusLogin";
import ParentPortal from "@/pages/ParentPortal";
import ParentLogin from "@/pages/ParentLogin";
import Landing from "@/pages/Landing";
import HowItWorks from "@/pages/HowItWorks";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import { TitleUpdater } from "@/components/TitleUpdater";

function App() {
  return (
    <BrowserRouter>
      <TitleUpdater />
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/parent-login" element={<ParentLogin />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/classroom-login" element={<ClassroomLogin />} />
          <Route path="/classroom-login/:roomId" element={<ClassroomLogin />} />
          <Route path="/bus-login/:busId" element={<BusLogin />} />

          {/* Protected / App Routes */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/register" element={<StudentRegister />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/:teacherId" element={<TeacherProfile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance/scan/:roomId/:teacherId" element={<Attendance />} />
            <Route path="/student-portal" element={<StudentPortal />} />
            <Route path="/bus-attendance" element={<BusAttendance />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Standalone Routes */}
          <Route path="/parent-portal" element={<ParentPortal />} />

        </Routes>
        <Toaster />
        <SonnerToaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
