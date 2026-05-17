import { Link } from "react-router-dom";

// Shown when the user visits a URL that does not exist
function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <h1 style={{ fontSize: "64px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>404</h1>
      <p style={{ fontSize: "18px", color: "#64748b", marginBottom: "32px" }}>
        That page does not exist.
      </p>
      <Link
        to="/dashboard"
        style={{
          background: "#3b82f6", color: "white", padding: "10px 24px",
          borderRadius: "8px", textDecoration: "none", fontWeight: "600",
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
