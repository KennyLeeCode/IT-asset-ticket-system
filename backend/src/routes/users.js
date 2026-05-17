const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, updateUserRole, deleteUser } = require("../controllers/userController");
const { requireAuth, requireRole } = require("../middleware/auth");

// All user management routes require the caller to be logged in and be an admin

// GET /api/users - Get a list of all users
router.get("/", requireAuth, requireRole(["admin"]), getAllUsers);

// GET /api/users/:id - Get one user by their ID
router.get("/:id", requireAuth, requireRole(["admin"]), getUserById);

// PATCH /api/users/:id/role - Change a user's role
router.patch("/:id/role", requireAuth, requireRole(["admin"]), updateUserRole);

// DELETE /api/users/:id - Delete a user account
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteUser);

module.exports = router;
