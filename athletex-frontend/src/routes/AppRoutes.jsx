import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import EditProfile from "../pages/EditProfile";
import Performance from "../pages/Performance";
import Training from "../pages/Training";
import Achievements from "../pages/Achievements";
import Settings from "../pages/Settings";
import CoachDashboard from "../pages/coach/CoachDashboard";
import CoachAthletes from "../pages/coach/CoachAthletes";
import CoachAthleteProfile from "../pages/coach/CoachAthleteProfile";
import CoachTraining from "../pages/coach/CoachTraining";
import CoachAchievements from "../pages/coach/CoachAchievements";
import CoachAnalytics from "../pages/coach/CoachAnalytics";
import CoachReports from "../pages/coach/CoachReports";
import CoachNotifications from "../pages/coach/CoachNotifications";
import AthleteNotifications from "../pages/athlete/AthleteNotifications";
import ProtectedRoute from "../components/common/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="ATHLETE"><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute requiredRole="ATHLETE"><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute requiredRole="ATHLETE"><EditProfile /></ProtectedRoute>} />
      <Route path="/performance" element={<ProtectedRoute requiredRole="ATHLETE"><Performance /></ProtectedRoute>} />
      <Route path="/training" element={<ProtectedRoute requiredRole="ATHLETE"><Training /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute requiredRole="ATHLETE"><Achievements /></ProtectedRoute>} />
      <Route path="/athlete/notifications" element={<ProtectedRoute requiredRole="ATHLETE"><AthleteNotifications /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Coach Routes */}
      <Route path="/coach/dashboard" element={<ProtectedRoute requiredRole="COACH"><CoachDashboard /></ProtectedRoute>} />
      <Route path="/coach/athletes" element={<ProtectedRoute requiredRole="COACH"><CoachAthletes /></ProtectedRoute>} />
      <Route path="/coach/athletes/:athleteId" element={<ProtectedRoute requiredRole="COACH"><CoachAthleteProfile /></ProtectedRoute>} />
      <Route path="/coach/training" element={<ProtectedRoute requiredRole="COACH"><CoachTraining /></ProtectedRoute>} />
      <Route path="/coach/achievements" element={<ProtectedRoute requiredRole="COACH"><CoachAchievements /></ProtectedRoute>} />
      <Route path="/coach/analytics" element={<ProtectedRoute requiredRole="COACH"><CoachAnalytics /></ProtectedRoute>} />
      <Route path="/coach/reports" element={<ProtectedRoute requiredRole="COACH"><CoachReports /></ProtectedRoute>} />
      <Route path="/coach/notifications" element={<ProtectedRoute requiredRole="COACH"><CoachNotifications /></ProtectedRoute>} />
      

    </Routes>
  );
}

export default AppRoutes;