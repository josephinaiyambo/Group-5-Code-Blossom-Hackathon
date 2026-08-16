const Database = require('better-sqlite3');
const db = new Database('market_access.db');

db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS buyers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('restaurant','hotel','school','retailer','wholesaler')),
  location TEXT NOT NULL,
  region TEXT NOT NULL,
  contact TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS demands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity_needed REAL NOT NULL,
  budget_price REAL NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('once','weekly','monthly')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','completed','cancelled')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (buyer_id) REFERENCES buyers(id)
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS transport_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  distance TEXT NOT NULL,
  cost_per_km REAL NOT NULL,
  contact TEXT NOT NULL
);
`);

module.exports = db;
