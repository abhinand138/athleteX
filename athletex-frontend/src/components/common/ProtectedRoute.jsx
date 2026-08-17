import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(storedUser);

  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on actual role if access is denied
    if (user.role === "COACH") {
      return <Navigate to="/coach/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If logged in and role matches (or no role required), render the child components
  return children;
}
