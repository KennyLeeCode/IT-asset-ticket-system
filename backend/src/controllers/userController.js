const bcrypt = require("bcryptjs");
const pool = require("../config/database");

// GET ALL USERS
// Returns a list of every user in the system (admin only)
async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, department, created_at FROM users ORDER BY name ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// GET SINGLE USER
// Returns one user by their ID
async function getUserById(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, department, created_at FROM users WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// UPDATE USER ROLE
// Lets an admin change someone's role (admin, technician, or user)
async function updateUserRole(req, res) {
  const { role } = req.body;
  const validRoles = ["admin", "technician", "user"];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Role must be admin, technician, or user." });
  }

  try {
    const [result] = await pool.query("UPDATE users SET role = ? WHERE id = ?", [
      role,
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User role updated successfully." });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// DELETE USER
// Removes a user account from the system (admin only)
async function deleteUser(req, res) {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
