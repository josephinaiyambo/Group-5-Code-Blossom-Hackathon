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
  // products is owned by Part A / Part C's schema, but demands.product_id
  // needs a real FK target — IF NOT EXISTS makes this a safe no-op when
  // that table has already been created by another service.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      unit VARCHAR(20) DEFAULT 'kg',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_product_name (name)
    );
  `);

  // type enum merged with what Part C's schema/sample data actually use
  // ('shop', 'catering') so buyer records created via either service
  // are valid under the same constraint.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS buyers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type ENUM('restaurant','hotel','school','retailer','shop','wholesaler','catering') NOT NULL,
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
      FOREIGN KEY (buyer_id) REFERENCES buyers(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
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

  // Adapter view Part C's matchEngine.js reads demands through — keeps
  // matchEngine.js untouched while demands stays in Person B's shape.
  await pool.query(`
    CREATE OR REPLACE VIEW v_active_demands AS
    SELECT
      d.id AS demand_id,
      b.id AS buyer_id,
      b.name AS buyer_name,
      b.location AS buyer_location,
      pr.id AS product_id,
      pr.name AS product_name,
      d.quantity_needed AS quantity,
      d.budget_price AS budget_per_unit,
      (d.frequency <> 'once') AS recurring,
      (d.status = 'open') AS is_active
    FROM demands d
    JOIN buyers b ON d.buyer_id = b.id
    JOIN products pr ON d.product_id = pr.id
    WHERE d.status = 'open';
  `);
}

module.exports = { pool, initTables };
