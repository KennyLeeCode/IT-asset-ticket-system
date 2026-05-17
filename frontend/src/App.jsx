import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";

// These pages will be built in the next parts
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Assets from "./pages/Assets";

function App() {
  const { user } = useAuth();

  return (
    <>
      {/* Only show the nav bar when the user is logged in */}
      {user && <Navbar />}

      <Routes>
        {/* Public route - anyone can see the login page */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* Protected routes - only logged in users can access these */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tickets" element={<PrivateRoute><Tickets /></PrivateRoute>} />
        <Route path="/assets" element={<PrivateRoute><Assets /></PrivateRoute>} />

        {/* Send anyone visiting the root URL to the dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch any URL that does not match and redirect to the dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
