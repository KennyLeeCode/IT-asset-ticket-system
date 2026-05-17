const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Allow the React frontend to talk to this backend server
app.use(cors());

// Lets Express read JSON data sent in request bodies
app.use(express.json());

// Import route files (we will create these in later parts)
const authRoutes = require("./routes/auth");
const deviceRoutes = require("./routes/devices");
const ticketRoutes = require("./routes/tickets");
const userRoutes = require("./routes/users");

// Register each group of routes under their own URL prefix
app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);

// Simple health check route so you can confirm the server is running
app.get("/api/health", (req, res) => {
  res.json({ message: "IT Asset System API is running" });
});

// Start the server and listen for incoming requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
