import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  let user = null;
  try {
    user = JSON.parse(storedUser);
  } catch (e) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on actual role if access is denied
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "COACH") {
      return <Navigate to="/coach/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If logged in and role matches (or no role required), render the child components
  return children;
}
