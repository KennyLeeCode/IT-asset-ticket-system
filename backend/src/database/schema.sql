-- Create the database if it does not already exist
CREATE DATABASE IF NOT EXISTS it_asset_system;

-- Switch into the database so all tables are created inside it
USE it_asset_system;

-- USERS TABLE
-- Stores everyone who can log into the system
-- Role can be: admin (full control), technician (can handle tickets), or user (can submit tickets only)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'technician', 'user') NOT NULL DEFAULT 'user',
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEVICES TABLE
-- Stores every piece of hardware the company owns (laptops, desktops, monitors, etc.)
CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'printer', 'other') NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(150) UNIQUE,
  status ENUM('available', 'assigned', 'in_repair', 'retired') NOT NULL DEFAULT 'available',

  -- The user this device is currently given to (NULL means it is not assigned to anyone)
  assigned_to INT DEFAULT NULL,

  warranty_expiry DATE,
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- If the user gets deleted, we keep the device but clear the assignment
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- TICKETS TABLE
-- Stores every help desk request submitted by a user
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',

  -- The user who submitted this ticket
  created_by INT NOT NULL,

  -- The technician assigned to fix this ticket (NULL means not yet assigned)
  assigned_to INT DEFAULT NULL,

  -- The device this ticket is about (NULL if the issue is not device specific)
  device_id INT DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP DEFAULT NULL,

  -- If a user is deleted we still want to keep their ticket history
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
);

-- TICKET COMMENTS TABLE
-- Stores the back and forth messages between the user and the technician on a ticket
CREATE TABLE IF NOT EXISTS ticket_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- If the ticket is deleted remove all its comments too
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SEED DATA
-- Insert a default admin account so you can log in right away
-- Password is: admin123 (this is hashed in the application, this is just a placeholder)
INSERT IGNORE INTO users (name, email, password, role, department)
VALUES ('IT Admin', 'admin@company.com', 'WILL_BE_SET_BY_SEED_SCRIPT', 'admin', 'IT');
