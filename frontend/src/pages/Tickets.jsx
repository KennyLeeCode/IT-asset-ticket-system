import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Tickets.css";

// The tickets page shows all help desk tickets and lets users submit new ones
// Admins and technicians can also assign tickets and change their status from here
function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fields for the new ticket form
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter controls at the top of the list
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    loadTickets();
    // Only admins and technicians need the user list (for assigning tickets)
    if (user.role !== "user") {
      loadUsers();
    }
  }, []);

  async function loadTickets() {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }

  // Submit a new ticket
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      await api.post("/tickets", form);
      setForm({ title: "", description: "", priority: "medium" });
      setShowForm(false);
      await loadTickets();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  // Change the status of a ticket (admin/technician only)
  async function handleStatusChange(ticketId, newStatus) {
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      await loadTickets();
      // Refresh the selected ticket panel if it is open
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  // Assign a ticket to a technician (admin/technician only)
  async function handleAssign(ticketId, technicianId) {
    try {
      await api.patch(`/tickets/${ticketId}/assign`, { technician_id: technicianId || null });
      await loadTickets();
    } catch (err) {
      console.error("Failed to assign ticket:", err);
    }
  }

  // Apply the status and priority filters to the ticket list
  const filtered = tickets.filter((t) => {
    const statusMatch = filterStatus === "all" || t.status === filterStatus;
    const priorityMatch = filterPriority === "all" || t.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  // Only show technicians in the assign dropdown
  const technicians = users.filter((u) => u.role === "technician" || u.role === "admin");

  if (loading) {
    return <div className="page"><p>Loading tickets...</p></div>;
  }

  return (
    <div className="page">
      {/* Page header with submit button */}
      <div className="tickets-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Help Desk Tickets</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Ticket"}
        </button>
      </div>

      {/* New ticket submission form */}
      {showForm && (
        <div className="card ticket-form-card">
          <h2 className="card-section-title">Submit a New Ticket</h2>
          <form onSubmit={handleSubmit}>
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Brief description of the issue"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe the problem in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>
      )}

      {/* Filter bar */}
      <div className="ticket-filters">
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <span className="ticket-count">{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div className="card"><p style={{ color: "#94a3b8" }}>No tickets match the selected filters.</p></div>
      ) : (
        <div className="ticket-list">
          {filtered.map((ticket) => (
            <div
              key={ticket.id}
              className={`ticket-row card ${selectedTicket?.id === ticket.id ? "ticket-selected" : ""}`}
              onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
            >
              <div className="ticket-main">
                <div className="ticket-top">
                  <span className="ticket-id">#{ticket.id}</span>
                  <span className="ticket-title-text">{ticket.title}</span>
                </div>
                <div className="ticket-meta">
                  <span className={`badge badge-${ticket.priority}`}>{ticket.priority}</span>
                  <span className={`badge badge-${ticket.status}`}>{ticket.status.replace("_", " ")}</span>
                  <span className="ticket-meta-text">by {ticket.created_by_name}</span>
                  {ticket.assigned_to_name && (
                    <span className="ticket-meta-text">assigned to {ticket.assigned_to_name}</span>
                  )}
                  <span className="ticket-meta-text">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Admin/technician controls shown when the row is expanded */}
              {selectedTicket?.id === ticket.id && user.role !== "user" && (
                <div className="ticket-controls" onClick={(e) => e.stopPropagation()}>
                  <div className="control-group">
                    <label>Change Status</label>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label>Assign To</label>
                    <select
                      value={ticket.assigned_to || ""}
                      onChange={(e) => handleAssign(ticket.id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="ticket-description-box">
                    <strong>Description:</strong>
                    <p>{ticket.description}</p>
                  </div>
                </div>
              )}

              {/* Show description for regular users when expanded */}
              {selectedTicket?.id === ticket.id && user.role === "user" && (
                <div className="ticket-controls" onClick={(e) => e.stopPropagation()}>
                  <div className="ticket-description-box">
                    <strong>Description:</strong>
                    <p>{ticket.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tickets;
