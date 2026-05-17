import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

// The top navigation bar shown on every page after login
function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Helper to highlight the nav link for the page we are currently on
  function isActive(path) {
    return location.pathname.startsWith(path) ? "nav-link active" : "nav-link";
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">IT</span>
        <span className="brand-text">Asset Manager</span>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
        <Link to="/tickets" className={isActive("/tickets")}>Tickets</Link>
        <Link to="/assets" className={isActive("/assets")}>Assets</Link>

        {/* Only admins can see the user management link */}
        {user?.role === "admin" && (
          <Link to="/users" className={isActive("/users")}>Users</Link>
        )}
      </div>

      <div className="navbar-user">
        <span className="user-info">
          {user?.name}
          <span className="user-role">{user?.role}</span>
        </span>
        <button className="logout-btn" onClick={logout}>Log Out</button>
      </div>
    </nav>
  );
}

export default Navbar;
