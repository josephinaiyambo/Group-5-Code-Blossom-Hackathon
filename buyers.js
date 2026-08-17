const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { name, type, location, region, contact } = req.body;

  const validTypes = ['restaurant', 'hotel', 'school', 'retailer', 'wholesaler'];
  if (!name || !type || !location || !region || !contact) {
    return res.status(400).json({ error: 'name, type, location, region, and contact are all required' });
  }
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
  }

  const stmt = db.prepare(`
    INSERT INTO buyers (name, type, location, region, contact)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(name, type, location, region, contact);

  const buyer = db.prepare('SELECT * FROM buyers WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(buyer);
});

router.get('/', (req, res) => {
  const { region, type } = req.query;
  let query = 'SELECT * FROM buyers WHERE 1=1';
  const params = [];

  if (region) {
    query += ' AND region = ?';
    params.push(region);
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  query += ' ORDER BY created_at DESC';

  const buyers = db.prepare(query).all(...params);
  res.json(buyers);
});

router.get('/:id', (req, res) => {
  const buyer = db.prepare('SELECT * FROM buyers WHERE id = ?').get(req.params.id);
  if (!buyer) return res.status(404).json({ error: 'Buyer not found' });

  const demands = db.prepare('SELECT * FROM demands WHERE buyer_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ ...buyer, demands });
});

module.exports = router;
