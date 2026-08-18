require('dotenv').config();
const { pool, initTables } = require('./db');

async function input() {
  await initTables();

  const [b1] = await pool.query(
    'INSERT INTO buyers (name, type, location, region, contact) VALUES (?, ?, ?, ?, ?)',
    ['Hilltop Hotel', 'hotel', 'Windhoek CBD', 'Khomas', '+264 81 000 1111']
  );
  const [b2] = await pool.query(
    'INSERT INTO buyers (name, type, location, region, contact) VALUES (?, ?, ?, ?, ?)',
    ['Namib Grill Restaurant', 'restaurant', 'Klein Windhoek', 'Khomas', '+264 81 000 2222']
  );
  const [b3] = await pool.query(
    'INSERT INTO buyers (name, type, location, region, contact) VALUES (?, ?, ?, ?, ?)',
    ['Otjomuise Primary School', 'school', 'Otjomuise', 'Khomas', '+264 81 000 3333']
  );
  const [b4] = await pool.query(
    'INSERT INTO buyers (name, type, location, region, contact) VALUES (?, ?, ?, ?, ?)',
    ['Corner Shop Supermarket', 'retailer', 'Katutura', 'Khomas', '+264 81 000 4444']
  );

  await pool.query(
    `INSERT INTO demands (buyer_id, product_id, quantity_needed, budget_price, frequency, status) VALUES (?, 1, 300, 10, 'monthly', 'open')`,
    [b1.insertId]
  );
  await pool.query(
    `INSERT INTO demands (buyer_id, product_id, quantity_needed, budget_price, frequency, status) VALUES (?, 1, 150, 9.5, 'weekly', 'open')`,
    [b2.insertId]
  );
  await pool.query(
    `INSERT INTO demands (buyer_id, product_id, quantity_needed, budget_price, frequency, status) VALUES (?, 1, 80, 8.5, 'weekly', 'open')`,
    [b3.insertId]
  );
  await pool.query(
    `INSERT INTO demands (buyer_id, product_id, quantity_needed, budget_price, frequency, status) VALUES (?, 1, 500, 9, 'monthly', 'open')`,
    [b4.insertId]
  );

  await pool.query(
    'INSERT INTO transport_providers (name, coverage_area, cost_per_km, contact) VALUES (?, ?, ?, ?)',
    ['Windhoek Freight Co', 'Khomas', 5.5, '+264 81 500 1000']
  );
  await pool.query(
    'INSERT INTO transport_providers (name, coverage_area, cost_per_km, contact) VALUES (?, ?, ?, ?)',
    ['Central Namibia Logistics', 'Otjozondjupa', 6.0, '+264 81 500 2000']
  );

  console.log('Input complete: 4 buyers, 4 demands, 2 transport providers added.');
  process.exit(0);
}

input().catch((err) => {
  console.error('Input failed:', err.message);
  process.exit(1);
});
