const express = require("express");
const cors = require("cors");

const {
  initTables,
  pool
} = require("./db");

const buyersRouter =
  require("./buyers");

const demandsRouter =
  require("./demands");

const transportRouter =
  require("./transport");


const app = express();


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors()
);


/*
  We allow a larger JSON body because
  SellerDashboard can send an uploaded
  image as Base64 image_data.
*/

app.use(
  express.json({
    limit: "8mb"
  })
);


/* =========================================================
   EXISTING ROUTERS
========================================================= */

app.use(
  "/buyers",
  buyersRouter
);

app.use(
  "/demands",
  demandsRouter
);

app.use(
  "/transport-providers",
  transportRouter
);


/* =========================================================
   HEALTH / ROOT
========================================================= */

app.get(
  "/",
  (req, res) => {

    res.json({
      status:
        "ok",

      service:
        "Market Access Main API",

      endpoints: {
        products:
          "/products",

        buyers:
          "/buyers",

        demands:
          "/demands",

        producers:
          "/producers",

        listings:
          "/listings",

        transport:
          "/transport-providers"
      }
    });
  }
);


/* =========================================================
   PRODUCTS
========================================================= */

app.get(
  "/products",

  async (req, res) => {

    try {

      const [rows] =
        await pool.query(`
          SELECT
            id,
            name,
            category,
            unit

          FROM products

          ORDER BY name
        `);


      res.json(
        rows
      );


    } catch (err) {

      console.error(
        "Get products error:",
        err
      );


      res
        .status(500)
        .json({
          error:
            err.message
        });
    }
  }
);


/* =========================================================
   PRODUCERS
   POST /producers

   Used by SellerSetup.tsx
========================================================= */

app.post(
  "/producers",

  async (req, res) => {

    const {
      name,
      type,
      location,
      contact_phone,
      contact_email
    } = req.body;


    const validTypes = [
      "individual",
      "cooperative",
      "company",
      "farm"
    ];


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (
      !name ||
      !type ||
      !location
    ) {

      return res
        .status(400)
        .json({
          error:
            "name, type, and location are required"
        });
    }


    if (
      !validTypes.includes(type)
    ) {

      return res
        .status(400)
        .json({
          error:
            `type must be one of: ${validTypes.join(", ")}`
        });
    }


    try {

      /* -----------------------------------------
         CREATE PRODUCER
      ----------------------------------------- */

      const [result] =
        await pool.query(
          `
          INSERT INTO producers
          (
            name,
            type,
            location,
            contact_phone,
            contact_email
          )

          VALUES (?, ?, ?, ?, ?)
          `,
          [
            String(name).trim(),

            type,

            String(location).trim(),

            contact_phone
              ? String(contact_phone).trim()
              : null,

            contact_email
              ? String(contact_email).trim()
              : null
          ]
        );


      /* -----------------------------------------
         RETURN CREATED PRODUCER
      ----------------------------------------- */

      const [rows] =
        await pool.query(
          `
          SELECT *
          FROM producers
          WHERE id = ?
          `,
          [
            result.insertId
          ]
        );


      res
        .status(201)
        .json(
          rows[0]
        );


    } catch (err) {

      console.error(
        "Create producer error:",
        err
      );


      res
        .status(500)
        .json({
          error:
            err.message
        });
    }
  }
);


/* =========================================================
   GET ALL PRODUCERS
========================================================= */

app.get(
  "/producers",

  async (req, res) => {

    try {

      const [rows] =
        await pool.query(`
          SELECT *
          FROM producers
          ORDER BY created_at DESC
        `);


      res.json(
        rows
      );


    } catch (err) {

      console.error(
        "Get producers error:",
        err
      );


      res
        .status(500)
        .json({
          error:
            err.message
        });
    }
  }
);


/* =========================================================
   GET ONE PRODUCER
   GET /producers/:id
========================================================= */

app.get(
  "/producers/:id",

  async (req, res) => {

    const producerId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(producerId) ||
      producerId <= 0
    ) {

      return res
        .status(400)
        .json({
          error:
            "Producer id must be a valid positive integer"
        });
    }


    try {

      const [rows] =
        await pool.query(
          `
          SELECT *
          FROM producers
          WHERE id = ?
          `,
          [
            producerId
          ]
        );


      if (
        rows.length === 0
      ) {

        return res
          .status(404)
          .json({
            error:
              "Producer not found"
          });
      }


      res.json(
        rows[0]
      );


    } catch (err) {

      console.error(
        "Get producer error:",
        err
      );


      res
        .status(500)
        .json({
          error:
            err.message
        });
    }
  }
);


/* =========================================================
   CREATE LISTING
   POST /listings

   Used by SellerDashboard.tsx
========================================================= */

app.post(
  "/listings",

  async (req, res) => {

    const {
      producer_id,
      product_id,
      quantity,
      price_per_unit,
      available_date,
      image_data
    } = req.body;


    /* -----------------------------------------
       REQUIRED VALUES
    ----------------------------------------- */

    if (
      producer_id === undefined ||
      product_id === undefined ||
      quantity === undefined ||
      price_per_unit === undefined ||
      !available_date
    ) {

      return res
        .status(400)
        .json({
          error:
            "producer_id, product_id, quantity, price_per_unit, and available_date are required"
        });
    }


    const producerId =
      Number(
        producer_id
      );

    const productId =
      Number(
        product_id
      );

    const listingQuantity =
      Number(
        quantity
      );

    const price =
      Number(
        price_per_unit
      );


    /* -----------------------------------------
       VALIDATE IDS
    ----------------------------------------- */

    if (
      !Number.isInteger(producerId) ||
      producerId <= 0
    ) {

      return res
        .status(400)
        .json({
          error:
            "producer_id must be a valid positive integer"
        });
    }


    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {

      return res
        .status(400)
        .json({
          error:
            "product_id must be a valid positive integer"
        });
    }


    /* -----------------------------------------
       VALIDATE QUANTITY / PRICE
    ----------------------------------------- */

    if (
      !Number.isFinite(listingQuantity) ||
      listingQuantity <= 0
    ) {

      return res
        .status(400)
        .json({
          error:
            "quantity must be greater than 0"
        });
    }


    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {

      return res
        .status(400)
        .json({
          error:
            "price_per_unit must be greater than 0"
        });
    }


    try {

      /* -----------------------------------------
         CHECK PRODUCER EXISTS
      ----------------------------------------- */

      const [producers] =
        await pool.query(
          `
          SELECT id
          FROM producers
          WHERE id = ?
          `,
          [
            producerId
          ]
        );


      if (
        producers.length === 0
      ) {

        return res
          .status(404)
          .json({
            error:
              "producer_id does not match an existing producer"
          });
      }


      /* -----------------------------------------
         CHECK PRODUCT EXISTS
      ----------------------------------------- */

      const [products] =
        await pool.query(
          `
          SELECT id
          FROM products
          WHERE id = ?
          `,
          [
            productId
          ]
        );


      if (
        products.length === 0
      ) {

        return res
          .status(404)
          .json({
            error:
              "product_id does not match an existing product"
          });
      }


      /* -----------------------------------------
         CREATE LISTING
      ----------------------------------------- */

      const [result] =
        await pool.query(
          `
          INSERT INTO listings
          (
            producer_id,
            product_id,
            quantity,
            price_per_unit,
            available_date,
            image_data,
            is_active
          )

          VALUES
          (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            TRUE
          )
          `,
          [
            producerId,
            productId,
            listingQuantity,
            price,
            available_date,
            image_data || null
          ]
        );


      /* -----------------------------------------
         RETURN FULL CREATED LISTING
      ----------------------------------------- */

      const [rows] =
        await pool.query(
          `
          SELECT

            l.id,

            l.producer_id,

            l.product_id,

            l.quantity,

            l.price_per_unit,

            l.available_date,

            l.image_data,

            l.is_active,

            l.created_at,

            p.name
              AS producer_name,

            p.location
              AS producer_location,

            pr.name
              AS product_name,

            pr.category,

            pr.unit

          FROM listings l

          JOIN producers p
            ON l.producer_id =
               p.id

          JOIN products pr
            ON l.product_id =
               pr.id

          WHERE l.id = ?
          `,
          [
            result.insertId
          ]
        );


      res
        .status(201)
        .json(
          rows[0]
        );


    } catch (err) {

      console.error(
        "Create listing error:",
        err
      );


      res
        .status(500)
        .json({
          error:
            err.message
        });
    }
  }
);


/* =========================================================
   GET LISTINGS

   All:
   GET /listings

   Seller-specific:
   GET /listings?producer_id=3
========================================================= */

app.get(
  "/listings",

  async (req, res) => {

    const {
      producer_id
    } = req.query;


    let query =
      `
      SELECT

        l.id,

        l.producer_id,

        l.product_id,

        l.quantity,

        l.price_per_unit,

        l.available_date,

        l.image_data,

        l.is_active,

        l.created_at,

        p.name
          AS producer_name,

        p.location
          AS producer_location,

        pr.name
          AS product_name,

        pr.category,

        pr.unit

      FROM listings l

      JOIN producers p
        ON l.producer_id =
           p.id

      JOIN products pr
        ON l.product_id =
           pr.id

      WHERE 1 = 1
      `;


    const params = [];


    /* -----------------------------------------
       OPTIONAL PRODUCER FILTER
    ----------------------------------------- */

    if (
      producer_id
    ) {

      const producerId =
        Number(
          producer_id
        );


      if (
        !Number.isInteger(producerId) ||
        producerId <= 0
      ) {

        return res
          .status(400)
          .json({
            error:
              "producer_id must be a valid positive integer"
          });
      }


      query +=
        " AND l.producer_id = ?";


      params.push(
        producerId
      );
    }


    query +=
      " ORDER BY l.created_at DESC";


    try {

      const [rows] =
        await pool.query(
          query,
          params
        );


      res.json(
        rows
      );


    } catch (err) {

      console.error(
        "Get listings error:",
        err
      );


      res
        .status(500)
        .json({
          error:
            err.message
        });
    }
  }
);


/* =========================================================
   SERVER PORT
========================================================= */

const PORT =
  process.env.PERSON_B_PORT ||
  4000;


/* =========================================================
   INITIALIZE DATABASE BEFORE LISTENING
========================================================= */

async function startServer() {

  try {

    await initTables();


    app.listen(
      PORT,

      () => {

        console.log(
          `✅ Main API running on http://localhost:${PORT}`
        );

        console.log(
          `Products: http://localhost:${PORT}/products`
        );

        console.log(
          `Buyers: http://localhost:${PORT}/buyers`
        );

        console.log(
          `Producers: http://localhost:${PORT}/producers`
        );

        console.log(
          `Listings: http://localhost:${PORT}/listings`
        );
      }
    );


  } catch (err) {

    console.error(
      "❌ Failed to set up database tables:",
      err.message
    );


    process.exit(1);
  }
}


startServer();