// matchServer.js
// Matching Engine API for Namibia Market Access Network

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const dotenv = require("dotenv");

const {
    runMatching
} = require("./matchEngine");


dotenv.config();


const app = express();


/* =========================================================
   PORT

   Main API:
   http://localhost:4000

   Matching API:
   http://localhost:5000
========================================================= */

const PORT =
    process.env.MATCH_ENGINE_PORT ||
    5000;


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors());

app.use(
    express.json()
);


/* =========================================================
   DATABASE CONNECTION POOL
========================================================= */

const pool =
    mysql.createPool({
        host:
            process.env.DB_HOST ||
            "localhost",

        user:
            process.env.DB_USER ||
            "root",

        password:
            process.env.DB_PASSWORD ||
            "",

        database:
            process.env.DB_NAME ||
            "market_access_demo",

        waitForConnections:
            true,

        connectionLimit:
            10,

        queueLimit:
            0
    });


/* =========================================================
   POST /api/matches/run

   Two possibilities:

   1. {}

      Run matching for ALL active demands.
      Used when seller adds new produce.

   2. { demand_id: 5 }

      Run matching only for demand 5.
      Used after buyer posts a new need.
========================================================= */

app.post(
    "/api/matches/run",

    async (req, res) => {

        let connection;


        try {

            /* ---------------------------------------------
               GET OPTIONAL DEMAND ID
            --------------------------------------------- */

            const rawDemandId =
                req.body?.demand_id;


            let demandId =
                null;


            if (
                rawDemandId !== undefined &&
                rawDemandId !== null &&
                rawDemandId !== ""
            ) {

                demandId =
                    Number(
                        rawDemandId
                    );


                if (
                    !Number.isInteger(
                        demandId
                    ) ||
                    demandId <= 0
                ) {

                    return res
                        .status(400)
                        .json({
                            success:
                                false,

                            error:
                                "demand_id must be a valid positive number."
                        });
                }
            }


            /* ---------------------------------------------
               GET MYSQL CONNECTION
            --------------------------------------------- */

            connection =
                await pool.getConnection();


            /* ---------------------------------------------
               RUN MATCHING
            --------------------------------------------- */

            const result =
                await runMatching(
                    connection,
                    demandId
                );


            /* ---------------------------------------------
               SUCCESS RESPONSE
            --------------------------------------------- */

            res.json({
                success:
                    true,

                message:
                    result.message ||
                    `Matching completed: ${result.matches_inserted} matches saved.`,

                data:
                    result
            });


        } catch (error) {

            console.error(
                "Matching failed:",
                error
            );


            res
                .status(500)
                .json({
                    success:
                        false,

                    message:
                        "Matching failed",

                    error:
                        error.message
                });


        } finally {

            /*
                Always release the MySQL
                connection even if something
                goes wrong.
            */

            if (connection) {
                connection.release();
            }
        }
    }
);


/* =========================================================
   GET /api/matches

   Examples:

   All:
   /api/matches

   Buyer:
   /api/matches?demand_id=5

   Seller:
   /api/matches?producer_id=3
========================================================= */

app.get(
    "/api/matches",

    async (req, res) => {

        let connection;


        try {

            connection =
                await pool.getConnection();


            /* ---------------------------------------------
               BUILD FILTERS
            --------------------------------------------- */

            const conditions = [
                "m.status = 'pending'"
            ];


            const params = [];


            /* ---------------------------------------------
               BUYER DEMAND FILTER
            --------------------------------------------- */

            if (
                req.query.demand_id
            ) {

                const demandId =
                    Number(
                        req.query.demand_id
                    );


                if (
                    !Number.isInteger(
                        demandId
                    ) ||
                    demandId <= 0
                ) {

                    return res
                        .status(400)
                        .json({
                            success:
                                false,

                            error:
                                "demand_id must be a valid positive number."
                        });
                }


                conditions.push(
                    "m.demand_id = ?"
                );


                params.push(
                    demandId
                );
            }


            /* ---------------------------------------------
               PRODUCER / FARMER FILTER
            --------------------------------------------- */

            if (
                req.query.producer_id
            ) {

                const producerId =
                    Number(
                        req.query.producer_id
                    );


                if (
                    !Number.isInteger(
                        producerId
                    ) ||
                    producerId <= 0
                ) {

                    return res
                        .status(400)
                        .json({
                            success:
                                false,

                            error:
                                "producer_id must be a valid positive number."
                        });
                }


                conditions.push(
                    "p.id = ?"
                );


                params.push(
                    producerId
                );
            }


            /* ---------------------------------------------
               CREATE WHERE CLAUSE
            --------------------------------------------- */

            const whereClause =
                `WHERE ${conditions.join(
                    " AND "
                )}`;


            /* ---------------------------------------------
               GET COMPLETE MATCH INFORMATION
            --------------------------------------------- */

            const [rows] =
                await connection.query(
                    `
                    SELECT

                        -- MATCH
                        m.id,
                        m.score,
                        m.distance_km,
                        m.transport_cost,
                        m.price_difference,
                        m.status,


                        -- PRODUCER / FARMER
                        p.id
                            AS producer_id,

                        p.name
                            AS producer_name,

                        p.location
                            AS producer_location,

                        p.contact_phone
                            AS producer_phone,

                        p.contact_email
                            AS producer_email,


                        -- SELLER LISTING
                        l.id
                            AS listing_id,

                        l.quantity
                            AS available_qty,

                        l.price_per_unit
                            AS seller_price,

                        l.available_date,

                        l.image_data,


                        -- BUYER
                        b.id
                            AS buyer_id,

                        b.name
                            AS buyer_name,

                        b.location
                            AS buyer_location,

                        b.contact
                            AS buyer_contact,


                        -- BUYER DEMAND
                        d.id
                            AS demand_id,

                        d.quantity_needed
                            AS demanded_qty,

                        d.budget_price
                            AS buyer_budget,

                        d.frequency,


                        -- PRODUCT
                        pr.id
                            AS product_id,

                        pr.name
                            AS product_name,

                        pr.category
                            AS product_category,

                        pr.unit


                    FROM matches m


                    JOIN listings l
                        ON m.listing_id =
                           l.id


                    JOIN producers p
                        ON l.producer_id =
                           p.id


                    JOIN products pr
                        ON l.product_id =
                           pr.id


                    JOIN demands d
                        ON m.demand_id =
                           d.id


                    JOIN buyers b
                        ON d.buyer_id =
                           b.id


                    ${whereClause}


                    ORDER BY
                        m.score DESC,
                        m.created_at DESC
                    `,

                    params
                );


            /* ---------------------------------------------
               RETURN MATCHES
            --------------------------------------------- */

            res.json({
                success:
                    true,

                matches:
                    rows
            });


        } catch (error) {

            console.error(
                "Failed to fetch matches:",
                error
            );


            res
                .status(500)
                .json({
                    success:
                        false,

                    message:
                        "Failed to fetch matches",

                    error:
                        error.message
                });


        } finally {

            if (connection) {
                connection.release();
            }
        }
    }
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/api/health",

    async (req, res) => {

        try {

            await pool.query(
                "SELECT 1"
            );


            res.json({
                status:
                    "ok",

                service:
                    "Market Access Matching Engine",

                port:
                    Number(PORT),

                database:
                    process.env.DB_NAME ||
                    "market_access_demo"
            });


        } catch (error) {

            res
                .status(500)
                .json({
                    status:
                        "error",

                    service:
                        "Market Access Matching Engine",

                    error:
                        error.message
                });
        }
    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,

    () => {

        console.log(
            `🇳🇦 Matching Engine running on http://localhost:${PORT}`
        );

        console.log(
            `Health check: http://localhost:${PORT}/api/health`
        );
    }
);