const express = require("express");
const router = express.Router();
const {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  assignDevice,
  deleteDevice,
} = require("../controllers/deviceController");
const { requireAuth, requireRole } = require("../middleware/auth");

// All device routes require the user to be logged in
// Only admins and technicians can create, edit, assign, or delete devices
// Any logged in user can view the device list

// GET /api/devices - Get all devices in inventory
router.get("/", requireAuth, getAllDevices);

// GET /api/devices/:id - Get one device by ID
router.get("/:id", requireAuth, getDeviceById);

// POST /api/devices - Add a new device to inventory
router.post("/", requireAuth, requireRole(["admin", "technician"]), createDevice);

// PUT /api/devices/:id - Update device details
router.put("/:id", requireAuth, requireRole(["admin", "technician"]), updateDevice);

// PATCH /api/devices/:id/assign - Assign or unassign a device to a user
router.patch("/:id/assign", requireAuth, requireRole(["admin", "technician"]), assignDevice);

// DELETE /api/devices/:id - Remove a device from inventory
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteDevice);

module.exports = router;
