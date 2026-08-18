// server.js - Part C API Endpoint
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const { runMatching } = require('./matchEngine');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// POST /api/matches/run - Triggers the matching engine
app.post('/api/matches/run', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const result = await runMatching(connection);
        connection.release();

        res.json({
            success: true,
            message: `Matching completed: ${result.matches_inserted} new matches saved.`,
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Matching failed', error: error.message });
    }
});

// GET /api/matches - Fetches the latest matches for the frontend
app.get('/api/matches', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(`
            SELECT 
                m.id, m.score, m.distance_km, m.transport_cost, m.price_difference, m.status,
                p.name AS producer_name, p.location AS producer_location,
                l.quantity AS available_qty, l.price_per_unit AS seller_price,
                b.name AS buyer_name, b.location AS buyer_location,
                d.quantity AS demanded_qty, d.budget_per_unit AS buyer_budget,
                pr.name AS product_name
            FROM matches m
            JOIN listings l ON m.listing_id = l.id
            JOIN producers p ON l.producer_id = p.id
            JOIN products pr ON l.product_id = pr.id
            JOIN demands d ON m.demand_id = d.id
            JOIN buyers b ON d.buyer_id = b.id
            WHERE m.status = 'pending'
            ORDER BY m.score DESC
        `);
        connection.release();
        res.json({ success: true, matches: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch matches', error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Part C - Matching Engine is running! 🚀' });
});

app.listen(port, () => {
    console.log(`🇳🇦 Namibia Market Access Network - Matching Engine running on port ${port}`);
});