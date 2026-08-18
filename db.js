require('dotenv').config();
const mysql = require('mysql2/promise'); 

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'market_access',
  waitForConnections: true,
  connectionLimit: 10,
});

async function initTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS buyers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type ENUM('restaurant','hotel','school','retailer','wholesaler') NOT NULL,
      location VARCHAR(255) NOT NULL,
      region VARCHAR(100) NOT NULL,
      contact VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS demands (
      id INT AUTO_INCREMENT PRIMARY KEY,
      buyer_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity_needed DECIMAL(10,2) NOT NULL,
      budget_price DECIMAL(10,2) NOT NULL,
      frequency ENUM('once','weekly','monthly') NOT NULL,
      status ENUM('open','fulfilled','cancelled') NOT NULL DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES buyers(id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transport_providers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      coverage_area VARCHAR(100) NOT NULL,
      cost_per_km DECIMAL(10,2) NOT NULL,
      contact VARCHAR(100) NOT NULL
    );
  `);
}

module.exports = { pool, initTables };
