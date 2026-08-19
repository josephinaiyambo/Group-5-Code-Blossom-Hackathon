const express = require("express");
const db = require("../db/connection");

const router = express.Router();

// Get all listings
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                listings.id,
                listings.quantity,
                listings.unit,
                listings.price,
                listings.availability_start,
                listings.availability_end,
                listings.created_at,
                producers.id AS producer_id,
                producers.name AS producer_name,
                producers.email AS producer_email,
                producers.phone AS producer_phone,
                producers.location AS producer_location,
                products.id AS product_id,
                products.name AS product_name,
                products.category AS product_category,
                products.description AS product_description
            FROM listings
            JOIN producers
                ON listings.producer_id = producers.id
            JOIN products
                ON listings.product_id = products.id
            ORDER BY listings.created_at DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve listings"
        });
    }
});

// Get one listing
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(`
            SELECT
                listings.id,
                listings.quantity,
                listings.unit,
                listings.price,
                listings.availability_start,
                listings.availability_end,
                listings.created_at,
                producers.id AS producer_id,
                producers.name AS producer_name,
                producers.email AS producer_email,
                producers.phone AS producer_phone,
                producers.location AS producer_location,
                products.id AS product_id,
                products.name AS product_name,
                products.category AS product_category,
                products.description AS product_description
            FROM listings
            JOIN producers
                ON listings.producer_id = producers.id
            JOIN products
                ON listings.product_id = products.id
            WHERE listings.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Listing not found"
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve listing"
        });
    }
});

// Create listing
router.post("/", async (req, res) => {
    try {
        const {
            producer_id,
            product_id,
            quantity,
            unit,
            price,
            availability_start,
            availability_end
        } = req.body;

        if (!producer_id || !product_id || !quantity || !price) {
            return res.status(400).json({
                message: "Producer, product, quantity and price are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO listings
            (producer_id, product_id, quantity, unit, price, availability_start, availability_end)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                producer_id,
                product_id,
                quantity,
                unit,
                price,
                availability_start,
                availability_end
            ]
        );

        res.status(201).json({
            message: "Listing created successfully",
            listingId: result.insertId
        });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                message: "The producer or product does not exist"
            });
        }

        res.status(500).json({
            message: "Failed to create listing"
        });
    }
});

// Update listing
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            producer_id,
            product_id,
            quantity,
            unit,
            price,
            availability_start,
            availability_end
        } = req.body;

        if (!producer_id || !product_id || !quantity || !price) {
            return res.status(400).json({
                message: "Producer, product, quantity and price are required"
            });
        }

        const [result] = await db.query(
            `UPDATE listings
             SET producer_id = ?,
                 product_id = ?,
                 quantity = ?,
                 unit = ?,
                 price = ?,
                 availability_start = ?,
                 availability_end = ?
             WHERE id = ?`,
            [
                producer_id,
                product_id,
                quantity,
                unit,
                price,
                availability_start,
                availability_end,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Listing not found"
            });
        }

        res.json({
            message: "Listing updated successfully"
        });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                message: "The producer or product does not exist"
            });
        }

        res.status(500).json({
            message: "Failed to update listing"
        });
    }
});

// Delete listing
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM listings WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Listing not found"
            });
        }

        res.json({
            message: "Listing deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete listing"
        });
    }
});

module.exports = router;