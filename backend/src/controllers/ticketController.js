const pool = require("../config/database");

// GET ALL TICKETS
// Admins and technicians see all tickets. Regular users only see their own tickets.
async function getAllTickets(req, res) {
  try {
    let query = `
      SELECT
        t.*,
        creator.name AS created_by_name,
        assignee.name AS assigned_to_name,
        d.name AS device_name
      FROM tickets t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      LEFT JOIN devices d ON t.device_id = d.id
    `;
    const params = [];

    // Regular users can only see tickets they submitted themselves
    if (req.user.role === "user") {
      query += " WHERE t.created_by = ?";
      params.push(req.user.id);
    }

    query += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Get all tickets error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// GET SINGLE TICKET
// Returns one ticket plus all of its comments
async function getTicketById(req, res) {
  try {
    const [tickets] = await pool.query(`
      SELECT
        t.*,
        creator.name AS created_by_name,
        assignee.name AS assigned_to_name,
        d.name AS device_name
      FROM tickets t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      LEFT JOIN devices d ON t.device_id = d.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (tickets.length === 0) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const ticket = tickets[0];

    // Regular users can only view their own tickets
    if (req.user.role === "user" && ticket.created_by !== req.user.id) {
      return res.status(403).json({ message: "You do not have permission to view this ticket." });
    }

    // Fetch all comments for this ticket
    const [comments] = await pool.query(`
      SELECT tc.*, u.name AS author_name, u.role AS author_role
      FROM ticket_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.ticket_id = ?
      ORDER BY tc.created_at ASC
    `, [req.params.id]);

    res.json({ ...ticket, comments });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// CREATE TICKET
// Any logged in user can submit a new help desk ticket
async function createTicket(req, res) {
  const { title, description, priority, device_id } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO tickets (title, description, priority, device_id, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, priority || "medium", device_id || null, req.user.id]
    );

    res.status(201).json({ message: "Ticket submitted successfully.", ticketId: result.insertId });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// UPDATE TICKET STATUS
// Admins and technicians can move a ticket through its stages
async function updateTicketStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ["open", "in_progress", "resolved", "closed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Status must be open, in_progress, resolved, or closed." });
  }

  try {
    // If the ticket is being marked resolved record the exact time it was resolved
    const resolvedAt = status === "resolved" ? new Date() : null;

    const [result] = await pool.query(
      "UPDATE tickets SET status = ?, resolved_at = COALESCE(?, resolved_at) WHERE id = ?",
      [status, resolvedAt, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    res.json({ message: "Ticket status updated." });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// ASSIGN TICKET
// Admins and technicians can assign a ticket to a specific technician
async function assignTicket(req, res) {
  const { technician_id } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE tickets SET assigned_to = ?, status = 'in_progress' WHERE id = ?",
      [technician_id || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    res.json({ message: "Ticket assigned successfully." });
  } catch (error) {
    console.error("Assign ticket error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// ADD COMMENT
// Anyone involved can add a comment to a ticket thread
async function addComment(req, res) {
  const { comment } = req.body;

  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "Comment text is required." });
  }

  try {
    // Check the ticket exists and the user has permission to comment on it
    const [tickets] = await pool.query("SELECT * FROM tickets WHERE id = ?", [req.params.id]);
    if (tickets.length === 0) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const ticket = tickets[0];

    // Regular users can only comment on their own tickets
    if (req.user.role === "user" && ticket.created_by !== req.user.id) {
      return res.status(403).json({ message: "You do not have permission to comment on this ticket." });
    }

    const [result] = await pool.query(
      "INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)",
      [req.params.id, req.user.id, comment.trim()]
    );

    res.status(201).json({ message: "Comment added.", commentId: result.insertId });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// DELETE TICKET
// Only admins can permanently delete a ticket
async function deleteTicket(req, res) {
  try {
    const [result] = await pool.query("DELETE FROM tickets WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    res.json({ message: "Ticket deleted." });
  } catch (error) {
    console.error("Delete ticket error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

module.exports = { getAllTickets, getTicketById, createTicket, updateTicketStatus, assignTicket, addComment, deleteTicket };
