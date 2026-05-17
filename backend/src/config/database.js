const mysql = require("mysql2/promise");

// Load environment variables from the .env file
require("dotenv").config();

// Create a connection pool so multiple requests can share database connections
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "it_asset_system",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
