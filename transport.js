const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { name, coverage_area, cost_per_km, contact } = req.body;

  if (!name || !coverage_area || !cost_per_km || !contact) {
    return res.status(400).json({ error: 'name, coverage_area, cost_per_km, and contact are all required' });
  }
  if (cost_per_km <= 0) {
    return res.status(400).json({ error: 'cost_per_km must be greater than 0' });
  }

  const stmt = db.prepare(`
    INSERT INTO transport_providers (name, coverage_area, cost_per_km, contact)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(name, coverage_area, cost_per_km, contact);

  const provider = db.prepare('SELECT * FROM transport_providers WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(provider);
});

router.get('/', (req, res) => {
  const { coverage_area } = req.query;
  let query = 'SELECT * FROM transport_providers WHERE 1=1';
  const params = [];

  if (coverage_area) {
    query += ' AND coverage_area = ?';
    params.push(coverage_area);
  }

  const providers = db.prepare(query).all(...params);
  res.json(providers);
});

module.exports = router;
