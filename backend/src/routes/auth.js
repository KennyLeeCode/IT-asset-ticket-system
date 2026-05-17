const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

// POST /api/auth/register - Create a new user account
router.post("/register", register);

// POST /api/auth/login - Log in and receive a JWT token
router.post("/login", login);

// GET /api/auth/me - Get the profile of whoever is currently logged in (requires token)
router.get("/me", requireAuth, getMe);

module.exports = router;
