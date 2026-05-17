const express = require("express");
const router = express.Router();
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  assignTicket,
  addComment,
  deleteTicket,
} = require("../controllers/ticketController");
const { requireAuth, requireRole } = require("../middleware/auth");

// All ticket routes require the user to be logged in

// GET /api/tickets - Get all tickets (admins and technicians see all, users see their own)
router.get("/", requireAuth, getAllTickets);

// GET /api/tickets/:id - Get one ticket plus its comments
router.get("/:id", requireAuth, getTicketById);

// POST /api/tickets - Submit a new help desk ticket
router.post("/", requireAuth, createTicket);

// PATCH /api/tickets/:id/status - Update the status of a ticket
router.patch("/:id/status", requireAuth, requireRole(["admin", "technician"]), updateTicketStatus);

// PATCH /api/tickets/:id/assign - Assign a ticket to a technician
router.patch("/:id/assign", requireAuth, requireRole(["admin", "technician"]), assignTicket);

// POST /api/tickets/:id/comments - Add a comment to a ticket
router.post("/:id/comments", requireAuth, addComment);

// DELETE /api/tickets/:id - Permanently delete a ticket
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteTicket);

module.exports = router;
