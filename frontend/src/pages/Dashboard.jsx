import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Dashboard.css";

// The dashboard shows a summary of the system at a glance
// Admins and technicians see stats for the whole system
// Regular users see only their own recent tickets
function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ticketRes, deviceRes] = await Promise.all([
          api.get("/tickets"),
          api.get("/devices"),
        ]);
        setTickets(ticketRes.data);
        setDevices(deviceRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Count how many tickets fall into each status category
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;

  // Count device statuses for the inventory summary
  const availableDevices = devices.filter((d) => d.status === "available").length;
  const assignedDevices = devices.filter((d) => d.status === "assigned").length;
  const inRepairDevices = devices.filter((d) => d.status === "in_repair").length;

  // Show the 5 most recent tickets on the dashboard
  const recentTickets = tickets.slice(0, 5);

  // Devices with warranties that expire within the next 30 days
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringDevices = devices.filter((d) => {
    if (!d.warranty_expiry) return false;
    const expiry = new Date(d.warranty_expiry);
    return expiry >= today && expiry <= in30Days;
  });

  if (loading) {
    return <div className="page"><p className="loading-text">Loading dashboard...</p></div>;
  }

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      <p className="dashboard-welcome">Welcome back, {user.name}</p>

      {/* Stat cards row */}
      <div className="stats-grid">
        <div className="stat-card stat-open">
          <div className="stat-value">{openTickets}</div>
          <div className="stat-label">Open Tickets</div>
        </div>
        <div className="stat-card stat-progress">
          <div className="stat-value">{inProgressTickets}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-value">{resolvedTickets}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card stat-devices">
          <div className="stat-value">{devices.length}</div>
          <div className="stat-label">Total Devices</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent tickets table */}
        <div className="card dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Recent Tickets</h2>
            <Link to="/tickets" className="card-link">View all</Link>
          </div>

          {recentTickets.length === 0 ? (
            <p className="empty-text">No tickets yet.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted by</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="ticket-title">{ticket.title}</td>
                    <td><span className={`badge badge-${ticket.priority}`}>{ticket.priority}</span></td>
                    <td><span className={`badge badge-${ticket.status}`}>{ticket.status.replace("_", " ")}</span></td>
                    <td>{ticket.created_by_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div className="dashboard-right">
          {/* Device inventory summary */}
          <div className="card dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Inventory Summary</h2>
              <Link to="/assets" className="card-link">View all</Link>
            </div>
            <div className="inventory-summary">
              <div className="inv-row">
                <span>Available</span>
                <span className="inv-count inv-available">{availableDevices}</span>
              </div>
              <div className="inv-row">
                <span>Assigned</span>
                <span className="inv-count inv-assigned">{assignedDevices}</span>
              </div>
              <div className="inv-row">
                <span>In Repair</span>
                <span className="inv-count inv-repair">{inRepairDevices}</span>
              </div>
            </div>
          </div>

          {/* Warranty expiry warnings */}
          <div className="card dashboard-card">
            <h2 className="card-title" style={{ marginBottom: "16px" }}>Warranties Expiring Soon</h2>
            {expiringDevices.length === 0 ? (
              <p className="empty-text">No warranties expiring in the next 30 days.</p>
            ) : (
              <ul className="warranty-list">
                {expiringDevices.map((d) => (
                  <li key={d.id} className="warranty-item">
                    <span className="warranty-name">{d.name}</span>
                    <span className="warranty-date">
                      {new Date(d.warranty_expiry).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
