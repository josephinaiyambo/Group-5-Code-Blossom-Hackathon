const express = require('express');
const router = express.Router();
const { pool } = require('./db');

router.post('/', async (req, res) => {
  const { name, type, location, region, contact } = req.body;
  const validTypes = ['restaurant', 'hotel', 'school', 'retailer', 'shop', 'wholesaler', 'catering'];

  if (!name || !type || !location || !region || !contact) {
    return res.status(400).json({ error: 'name, type, location, region, and contact are all required' });
  }
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO buyers (name, type, location, region, contact) VALUES (?, ?, ?, ?, ?)',
      [name, type, location, region, contact]
    );
    const [rows] = await pool.query('SELECT * FROM buyers WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { region, type } = req.query;
  let query = 'SELECT * FROM buyers WHERE 1=1';
  const params = [];

  if (region) { query += ' AND region = ?'; params.push(region); }
  if (type) { query += ' AND type = ?'; params.push(type); }
  query += ' ORDER BY created_at DESC';

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [buyers] = await pool.query('SELECT * FROM buyers WHERE id = ?', [req.params.id]);
    if (buyers.length === 0) return res.status(404).json({ error: 'Buyer not found' });

    const [demands] = await pool.query(
      'SELECT * FROM demands WHERE buyer_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ ...buyers[0], demands });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
