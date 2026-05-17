const pool = require("../config/database");

// GET ALL DEVICES
// Returns every device in the inventory with the name of who it is assigned to
async function getAllDevices(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.*,
        u.name AS assigned_to_name,
        u.email AS assigned_to_email
      FROM devices d
      LEFT JOIN users u ON d.assigned_to = u.id
      ORDER BY d.name ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Get all devices error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// GET SINGLE DEVICE
// Returns one device by its ID along with its assignment info
async function getDeviceById(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.*,
        u.name AS assigned_to_name,
        u.email AS assigned_to_email
      FROM devices d
      LEFT JOIN users u ON d.assigned_to = u.id
      WHERE d.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Device not found." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get device error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// CREATE DEVICE
// Adds a new piece of hardware to the inventory
async function createDevice(req, res) {
  const { name, type, brand, model, serial_number, warranty_expiry, purchase_date, notes } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: "Device name and type are required." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO devices (name, type, brand, model, serial_number, warranty_expiry, purchase_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, brand || null, model || null, serial_number || null, warranty_expiry || null, purchase_date || null, notes || null]
    );

    res.status(201).json({ message: "Device added to inventory.", deviceId: result.insertId });
  } catch (error) {
    // Catch duplicate serial number errors and return a clear message
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A device with that serial number already exists." });
    }
    console.error("Create device error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// UPDATE DEVICE
// Edits the details of an existing device
async function updateDevice(req, res) {
  const { name, type, brand, model, serial_number, status, warranty_expiry, purchase_date, notes } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE devices
       SET name = COALESCE(?, name),
           type = COALESCE(?, type),
           brand = COALESCE(?, brand),
           model = COALESCE(?, model),
           serial_number = COALESCE(?, serial_number),
           status = COALESCE(?, status),
           warranty_expiry = COALESCE(?, warranty_expiry),
           purchase_date = COALESCE(?, purchase_date),
           notes = COALESCE(?, notes)
       WHERE id = ?`,
      [name, type, brand, model, serial_number, status, warranty_expiry, purchase_date, notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Device not found." });
    }

    res.json({ message: "Device updated successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A device with that serial number already exists." });
    }
    console.error("Update device error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// ASSIGN DEVICE
// Links a device to a specific user and marks the device as assigned
async function assignDevice(req, res) {
  const { user_id } = req.body;

  try {
    // If user_id is null we are unassigning the device and marking it available
    const newStatus = user_id ? "assigned" : "available";

    const [result] = await pool.query(
      "UPDATE devices SET assigned_to = ?, status = ? WHERE id = ?",
      [user_id || null, newStatus, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Device not found." });
    }

    const action = user_id ? "assigned" : "unassigned";
    res.json({ message: `Device ${action} successfully.` });
  } catch (error) {
    console.error("Assign device error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// DELETE DEVICE
// Removes a device from the inventory permanently
async function deleteDevice(req, res) {
  try {
    const [result] = await pool.query("DELETE FROM devices WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Device not found." });
    }

    res.json({ message: "Device removed from inventory." });
  } catch (error) {
    console.error("Delete device error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

module.exports = { getAllDevices, getDeviceById, createDevice, updateDevice, assignDevice, deleteDevice };
