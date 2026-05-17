const bcrypt = require("bcryptjs");
const pool = require("../config/database");

// This script sets up the database tables and creates a default admin account
// Run it once with: node src/database/seed.js

async function seed() {
  try {
    console.log("Creating database tables...");

    // Create the users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'technician', 'user') NOT NULL DEFAULT 'user',
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create the devices table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'printer', 'other') NOT NULL,
        brand VARCHAR(100),
        model VARCHAR(100),
        serial_number VARCHAR(150) UNIQUE,
        status ENUM('available', 'assigned', 'in_repair', 'retired') NOT NULL DEFAULT 'available',
        assigned_to INT DEFAULT NULL,
        warranty_expiry DATE,
        purchase_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create the tickets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
        priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
        created_by INT NOT NULL,
        assigned_to INT DEFAULT NULL,
        device_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP DEFAULT NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
      )
    `);

    // Create the ticket comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Tables created successfully.");

    // Hash the default admin password before saving it to the database
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Insert the default admin account if it does not already exist
    await pool.query(
      `INSERT IGNORE INTO users (name, email, password, role, department)
       VALUES (?, ?, ?, 'admin', 'IT')`,
      ["IT Admin", "admin@company.com", hashedPassword]
    );

    console.log("Default admin account created.");
    console.log("Email: admin@company.com");
    console.log("Password: admin123");
    console.log("Seed complete. You can now start the server.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
