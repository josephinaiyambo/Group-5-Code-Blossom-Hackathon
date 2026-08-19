const express = require("express");
const cors = require("cors");

const db = require("./db/connection");

const producerRoutes = require("./routes/producer");
const productRoutes = require("./routes/product");
const listingRoutes = require("./routes/listing");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/producers", producerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/listings", listingRoutes);



// Test database connection
async function testDatabaseConnection() {
    try {
        const connection = await db.getConnection();
        console.log("Database connected successfully!");
        connection.release();
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Market Access API is running"
    });
});



// Start server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await testDatabaseConnection();
});