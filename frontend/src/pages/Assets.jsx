import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Assets.css";

// The assets page shows every device in the company inventory
// Admins and technicians can add devices, edit them, and assign them to users
function Assets() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fields for the add/edit device form
  const [form, setForm] = useState({
    name: "", type: "laptop", brand: "", model: "",
    serial_number: "", warranty_expiry: "", purchase_date: "", notes: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canEdit = user.role === "admin" || user.role === "technician";

  useEffect(() => {
    loadDevices();
    if (canEdit) loadUsers();
  }, []);

  async function loadDevices() {
    try {
      const res = await api.get("/devices");
      setDevices(res.data);
    } catch (err) {
      console.error("Failed to load devices:", err);
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

  // Pre-fill the form when the user clicks Edit on a device
  function openEdit(device) {
    setEditDevice(device);
    setForm({
      name: device.name || "",
      type: device.type || "laptop",
      brand: device.brand || "",
      model: device.model || "",
      serial_number: device.serial_number || "",
      warranty_expiry: device.warranty_expiry ? device.warranty_expiry.substring(0, 10) : "",
      purchase_date: device.purchase_date ? device.purchase_date.substring(0, 10) : "",
      notes: device.notes || "",
    });
    setShowForm(true);
    setFormError("");
  }

  // Clear the form when switching from edit to add mode
  function openAdd() {
    setEditDevice(null);
    setForm({ name: "", type: "laptop", brand: "", model: "", serial_number: "", warranty_expiry: "", purchase_date: "", notes: "" });
    setShowForm(true);
    setFormError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditDevice(null);
    setFormError("");
  }

  // Submit the form - either creates a new device or updates an existing one
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (editDevice) {
        await api.put(`/devices/${editDevice.id}`, form);
      } else {
        await api.post("/devices", form);
      }
      closeForm();
      await loadDevices();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save device.");
    } finally {
      setSubmitting(false);
    }
  }

  // Assign or unassign a device to a user
  async function handleAssign(deviceId, userId) {
    try {
      await api.patch(`/devices/${deviceId}/assign`, { user_id: userId || null });
      await loadDevices();
    } catch (err) {
      console.error("Failed to assign device:", err);
    }
  }

  // Remove a device from inventory after confirmation
  async function handleDelete(deviceId, deviceName) {
    if (!window.confirm(`Remove "${deviceName}" from inventory? This cannot be undone.`)) return;
    try {
      await api.delete(`/devices/${deviceId}`);
      await loadDevices();
    } catch (err) {
      console.error("Failed to delete device:", err);
    }
  }

  // Apply type and status filters to the device list
  const filtered = devices.filter((d) => {
    const typeMatch = filterType === "all" || d.type === filterType;
    const statusMatch = filterStatus === "all" || d.status === filterStatus;
    return typeMatch && statusMatch;
  });

  // Check whether a device warranty is expired so we can flag it in red
  function isExpired(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  if (loading) {
    return <div className="page"><p>Loading inventory...</p></div>;
  }

  return (
    <div className="page">
      {/* Page header */}
      <div className="assets-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Device Inventory</h1>
        {canEdit && (
          <button className="btn btn-primary" onClick={showForm ? closeForm : openAdd}>
            {showForm ? "Cancel" : "+ Add Device"}
          </button>
        )}
      </div>

      {/* Add / Edit device form */}
      {showForm && canEdit && (
        <div className="card asset-form-card">
          <h2 className="card-section-title">{editDevice ? "Edit Device" : "Add New Device"}</h2>
          <form onSubmit={handleSubmit}>
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-row">
              <div className="form-group">
                <label>Device Name *</label>
                <input type="text" placeholder="e.g. John's MacBook Pro" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="monitor">Monitor</option>
                  <option value="keyboard">Keyboard</option>
                  <option value="mouse">Mouse</option>
                  <option value="printer">Printer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Brand</label>
                <input type="text" placeholder="e.g. Apple, Dell, HP" value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input type="text" placeholder="e.g. MacBook Pro 14 M3" value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Serial Number</label>
                <input type="text" placeholder="Unique serial number" value={form.serial_number}
                  onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Purchase Date</label>
                <input type="date" value={form.purchase_date}
                  onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Warranty Expiry</label>
                <input type="date" value={form.warranty_expiry}
                  onChange={(e) => setForm({ ...form, warranty_expiry: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input type="text" placeholder="Any extra details" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : (editDevice ? "Save Changes" : "Add Device")}
            </button>
          </form>
        </div>
      )}

      {/* Filter bar */}
      <div className="asset-filters">
        <div className="filter-group">
          <label>Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="laptop">Laptop</option>
            <option value="desktop">Desktop</option>
            <option value="monitor">Monitor</option>
            <option value="keyboard">Keyboard</option>
            <option value="mouse">Mouse</option>
            <option value="printer">Printer</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="in_repair">In Repair</option>
            <option value="retired">Retired</option>
          </select>
        </div>
        <span className="ticket-count">{filtered.length} device{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Device table */}
      {filtered.length === 0 ? (
        <div className="card"><p style={{ color: "#94a3b8" }}>No devices match the selected filters.</p></div>
      ) : (
        <div className="card asset-table-card">
          <table className="asset-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Brand / Model</th>
                <th>Serial</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Warranty</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => (
                <tr key={device.id}>
                  <td className="device-name">{device.name}</td>
                  <td className="capitalize">{device.type}</td>
                  <td>{[device.brand, device.model].filter(Boolean).join(" ") || "—"}</td>
                  <td className="serial">{device.serial_number || "—"}</td>
                  <td><span className={`badge badge-${device.status}`}>{device.status.replace("_", " ")}</span></td>

                  {/* Assign dropdown lets you change who the device belongs to */}
                  <td>
                    {canEdit ? (
                      <select
                        className="assign-select"
                        value={device.assigned_to || ""}
                        onChange={(e) => handleAssign(device.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    ) : (
                      device.assigned_to_name || "—"
                    )}
                  </td>

                  {/* Warranty date shown in red if it has already expired */}
                  <td className={isExpired(device.warranty_expiry) ? "expired-date" : ""}>
                    {device.warranty_expiry
                      ? new Date(device.warranty_expiry).toLocaleDateString()
                      : "—"}
                    {isExpired(device.warranty_expiry) && <span className="expired-tag"> Expired</span>}
                  </td>

                  {canEdit && (
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(device)}>Edit</button>
                        {user.role === "admin" && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(device.id, device.name)}>Delete</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Assets;
