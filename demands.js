const express = require('express');
const router = express.Router();
const { pool } = require('./db');

router.post('/', async (req, res) => {
  const { buyer_id, product_id, quantity_needed, budget_price, frequency } = req.body;
  const validFrequencies = ['once', 'weekly', 'monthly'];

  if (!buyer_id || !product_id || !quantity_needed || !budget_price || !frequency) {
    return res.status(400).json({
      error: 'buyer_id, product_id, quantity_needed, budget_price, and frequency are all required'
    });
  }
  if (!validFrequencies.includes(frequency)) {
    return res.status(400).json({ error: `frequency must be one of: ${validFrequencies.join(', ')}` });
  }
  if (quantity_needed <= 0 || budget_price <= 0) {
    return res.status(400).json({ error: 'quantity_needed and budget_price must be greater than 0' });
  }

  try {
    const [buyers] = await pool.query('SELECT id FROM buyers WHERE id = ?', [buyer_id]);
    if (buyers.length === 0) return res.status(404).json({ error: 'buyer_id does not match an existing buyer' });

    const [result] = await pool.query(
      `INSERT INTO demands (buyer_id, product_id, quantity_needed, budget_price, frequency, status)
       VALUES (?, ?, ?, ?, ?, 'open')`,
      [buyer_id, product_id, quantity_needed, budget_price, frequency]
    );
    const [rows] = await pool.query('SELECT * FROM demands WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { status, product_id } = req.query;
  let query = 'SELECT * FROM demands WHERE 1=1';
  const params = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  else { query += " AND status = 'open'"; }
  if (product_id) { query += ' AND product_id = ?'; params.push(product_id); }
  query += ' ORDER BY created_at DESC';

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { status, quantity_needed, budget_price } = req.body;
  const validStatuses = ['open', 'fulfilled', 'cancelled'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM demands WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Demand not found' });

    await pool.query(
      `UPDATE demands
       SET status = COALESCE(?, status),
           quantity_needed = COALESCE(?, quantity_needed),
           budget_price = COALESCE(?, budget_price)
       WHERE id = ?`,
      [status || null, quantity_needed || null, budget_price || null, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM demands WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
