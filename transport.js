const express = require('express');
const router = express.Router();
const { pool } = require('./db');

router.post('/', async (req, res) => {
  const { name, coverage_area, cost_per_km, contact } = req.body;

  if (!name || !coverage_area || !cost_per_km || !contact) {
    return res.status(400).json({ error: 'name, coverage_area, cost_per_km, and contact are all required' });
  }
  if (cost_per_km <= 0) {
    return res.status(400).json({ error: 'cost_per_km must be greater than 0' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO transport_providers (name, coverage_area, cost_per_km, contact) VALUES (?, ?, ?, ?)',
      [name, coverage_area, cost_per_km, contact]
    );
    const [rows] = await pool.query('SELECT * FROM transport_providers WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { coverage_area } = req.query;
  let query = 'SELECT * FROM transport_providers WHERE 1=1';
  const params = [];

  if (coverage_area) { query += ' AND coverage_area = ?'; params.push(coverage_area); }

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
