const express = require("express");
const db = require("../db/connection");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM products ORDER BY created_at DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve products"
        });
    }
});

// Get one product
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM products WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve product"
        });
    }
});

// Create product
router.post("/", async (req, res) => {
    try {
        const { name, category, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Product name is required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO products (name, category, description)
             VALUES (?, ?, ?)`,
            [name, category, description]
        );

        res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create product"
        });
    }
});

// Update product
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Product name is required"
            });
        }

        const [result] = await db.query(
            `UPDATE products
             SET name = ?, category = ?, description = ?
             WHERE id = ?`,
            [name, category, description, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update product"
        });
    }
});

// Delete product
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM products WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete product"
        });
    }
});

module.exports = router;