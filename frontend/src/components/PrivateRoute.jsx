import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps any page that requires the user to be logged in
// If the user is not logged in they get sent to the login page automatically
function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but does not have the required role for this page
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PrivateRoute;
