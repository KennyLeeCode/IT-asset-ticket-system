const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

// REGISTER
// Creates a new user account with a hashed password
async function register(req, res) {
  const { name, email, password, department } = req.body;

  // Make sure all required fields are present
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    // Check if an account with this email already exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    // Hash the password so we never store the raw version in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to the database with the default role of 'user'
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, 'user', ?)",
      [name, email, hashedPassword, department || null]
    );

    res.status(201).json({ message: "Account created successfully.", userId: result.insertId });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// LOGIN
// Checks the email and password then returns a JWT token if they are correct
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Look up the user by their email address
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare the password they typed with the hashed version stored in the database
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Create a JWT token that expires in 8 hours
    // The token holds the user's id, role, and name so we do not need to re-query the DB on every request
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// GET CURRENT USER
// Returns the profile of whoever is currently logged in
async function getMe(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, department, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

module.exports = { register, login, getMe };
