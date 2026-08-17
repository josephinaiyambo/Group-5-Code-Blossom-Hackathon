const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
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

  const buyer = db.prepare('SELECT id FROM buyers WHERE id = ?').get(buyer_id);
  if (!buyer) return res.status(404).json({ error: 'buyer_id does not match an existing buyer' });

  const stmt = db.prepare(`
    INSERT INTO demands (buyer_id, product_id, quantity_needed, budget_price, frequency, status)
    VALUES (?, ?, ?, ?, ?, 'open')
  `);
  const result = stmt.run(buyer_id, product_id, quantity_needed, budget_price, frequency);

  const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(demand);
});

router.get('/', (req, res) => {
  const { status, product_id } = req.query;
  let query = 'SELECT * FROM demands WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  } else {
    query += " AND status = 'open'"; // default to open demands only
  }
  if (product_id) {
    query += ' AND product_id = ?';
    params.push(product_id);
  }
  query += ' ORDER BY created_at DESC';

  const demands = db.prepare(query).all(...params);
  res.json(demands);
});

router.put('/:id', (req, res) => {
  const { status, quantity_needed, budget_price } = req.body;
  const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
  if (!demand) return res.status(404).json({ error: 'Demand not found' });

  const validStatuses = ['open', 'fulfilled', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  db.prepare(`
    UPDATE demands
    SET status = COALESCE(?, status),
        quantity_needed = COALESCE(?, quantity_needed),
        budget_price = COALESCE(?, budget_price)
    WHERE id = ?
  `).run(status, quantity_needed, budget_price, req.params.id);

  const updated = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
  res.json(updated);
});

module.exports = router;
