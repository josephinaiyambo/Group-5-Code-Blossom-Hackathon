const express = require('express');
const { initTables, pool } = require('./db');
const cors = require("cors");
const buyersRouter = require('./buyers');
const demandsRouter = require('./demands');
const transportRouter = require('./transport');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/buyers', buyersRouter);
app.use('/demands', demandsRouter);
app.use('/transport-providers', transportRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Person B — buyers, demands, transport-providers API (MySQL)' });
});

app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, category, unit
      FROM products
      ORDER BY name
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});
const PORT = process.env.PERSON_B_PORT || 4000;
initTables()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Person B's API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to set up database tables:', err.message);
    process.exit(1);
  });
