const express = require("express");
const db = require("../db/connection");

const router = express.Router();

// Get all producers
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM producers ORDER BY created_at DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to retrieve producers"
        });
    }
});

// Get one producer
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM producers WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Producer not found"
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to retrieve producer"
        });
    }
});

// Create producer
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, location } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO producers (name, email, phone, location)
             VALUES (?, ?, ?, ?)`,
            [name, email, phone, location]
        );

        res.status(201).json({
            message: "Producer created successfully",
            producerId: result.insertId
        });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "A producer with this email already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create producer"
        });
    }
});

// Update producer
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, location } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const [result] = await db.query(
            `UPDATE producers
             SET name = ?, email = ?, phone = ?, location = ?
             WHERE id = ?`,
            [name, email, phone, location, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Producer not found"
            });
        }

        res.json({
            message: "Producer updated successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update producer"
        });
    }
});

// Delete producer
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM producers WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Producer not found"
            });
        }

        res.json({
            message: "Producer deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete producer"
        });
    }
});

module.exports = router;