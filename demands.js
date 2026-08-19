const express = require("express");
const router = express.Router();

const {
  pool
} = require("./db");


/* =========================================================
   ALLOWED VALUES
========================================================= */

const validFrequencies = [
  "once",
  "weekly",
  "monthly"
];

const validStatuses = [
  "open",
  "fulfilled",
  "cancelled"
];


/* =========================================================
   POST /demands
   Create a new buyer demand
========================================================= */

router.post("/", async (req, res) => {

  const {
    buyer_id,
    product_id,
    quantity_needed,
    budget_price,
    frequency
  } = req.body;


  /* -----------------------------------------
     REQUIRED FIELDS
  ----------------------------------------- */

  if (
    buyer_id === undefined ||
    product_id === undefined ||
    quantity_needed === undefined ||
    budget_price === undefined ||
    !frequency
  ) {

    return res
      .status(400)
      .json({
        error:
          "buyer_id, product_id, quantity_needed, budget_price, and frequency are all required"
      });
  }


  /* -----------------------------------------
     CONVERT NUMERIC INPUT
  ----------------------------------------- */

  const buyerId =
    Number(buyer_id);

  const productId =
    Number(product_id);

  const quantity =
    Number(quantity_needed);

  const budget =
    Number(budget_price);


  /* -----------------------------------------
     VALIDATE IDS
  ----------------------------------------- */

  if (
    !Number.isInteger(buyerId) ||
    buyerId <= 0
  ) {

    return res
      .status(400)
      .json({
        error:
          "buyer_id must be a valid positive integer"
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
     VALIDATE QUANTITY / BUDGET
  ----------------------------------------- */

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {

    return res
      .status(400)
      .json({
        error:
          "quantity_needed must be greater than 0"
      });
  }


  if (
    !Number.isFinite(budget) ||
    budget <= 0
  ) {

    return res
      .status(400)
      .json({
        error:
          "budget_price must be greater than 0"
      });
  }


  /* -----------------------------------------
     VALIDATE FREQUENCY
  ----------------------------------------- */

  if (
    !validFrequencies.includes(
      frequency
    )
  ) {

    return res
      .status(400)
      .json({
        error:
          `frequency must be one of: ${validFrequencies.join(", ")}`
      });
  }


  try {

    /* -----------------------------------------
       CHECK BUYER EXISTS
    ----------------------------------------- */

    const [buyers] =
      await pool.query(
        `
        SELECT id
        FROM buyers
        WHERE id = ?
        `,
        [
          buyerId
        ]
      );


    if (
      buyers.length === 0
    ) {

      return res
        .status(404)
        .json({
          error:
            "buyer_id does not match an existing buyer"
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
       CREATE DEMAND
    ----------------------------------------- */

    const [result] =
      await pool.query(
        `
        INSERT INTO demands
        (
          buyer_id,
          product_id,
          quantity_needed,
          budget_price,
          frequency,
          status
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          'open'
        )
        `,
        [
          buyerId,
          productId,
          quantity,
          budget,
          frequency
        ]
      );


    /* -----------------------------------------
       RETURN CREATED DEMAND
    ----------------------------------------- */

    const [rows] =
      await pool.query(
        `
        SELECT *
        FROM demands
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
      "Create demand error:",
      err
    );


    res
      .status(500)
      .json({
        error:
          err.message
      });
  }
});


/* =========================================================
   GET /demands

   Examples:

   /demands

   /demands?status=open

   /demands?product_id=1
========================================================= */

router.get("/", async (req, res) => {

  const {
    status,
    product_id
  } = req.query;


  let query =
    `
    SELECT *
    FROM demands
    WHERE 1 = 1
    `;


  const params = [];


  /* -----------------------------------------
     STATUS FILTER

     If no status is supplied,
     only return open demands.
  ----------------------------------------- */

  if (status) {

    if (
      !validStatuses.includes(
        status
      )
    ) {

      return res
        .status(400)
        .json({
          error:
            `status must be one of: ${validStatuses.join(", ")}`
        });
    }


    query +=
      " AND status = ?";

    params.push(
      status
    );

  } else {

    query +=
      " AND status = 'open'";
  }


  /* -----------------------------------------
     PRODUCT FILTER
  ----------------------------------------- */

  if (product_id) {

    const productId =
      Number(product_id);


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


    query +=
      " AND product_id = ?";

    params.push(
      productId
    );
  }


  query +=
    " ORDER BY created_at DESC";


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
      "Get demands error:",
      err
    );


    res
      .status(500)
      .json({
        error:
          err.message
      });
  }
});


/* =========================================================
   PUT /demands/:id

   Update demand status,
   quantity or budget.
========================================================= */

router.put("/:id", async (req, res) => {

  const demandId =
    Number(
      req.params.id
    );


  const {
    status,
    quantity_needed,
    budget_price
  } = req.body;


  /* -----------------------------------------
     VALID DEMAND ID
  ----------------------------------------- */

  if (
    !Number.isInteger(demandId) ||
    demandId <= 0
  ) {

    return res
      .status(400)
      .json({
        error:
          "Demand id must be a valid positive integer"
      });
  }


  /* -----------------------------------------
     VALIDATE STATUS
  ----------------------------------------- */

  if (
    status !== undefined &&
    !validStatuses.includes(
      status
    )
  ) {

    return res
      .status(400)
      .json({
        error:
          `status must be one of: ${validStatuses.join(", ")}`
      });
  }


  /* -----------------------------------------
     VALIDATE OPTIONAL QUANTITY
  ----------------------------------------- */

  let quantity = null;


  if (
    quantity_needed !== undefined
  ) {

    quantity =
      Number(
        quantity_needed
      );


    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {

      return res
        .status(400)
        .json({
          error:
            "quantity_needed must be greater than 0"
        });
    }
  }


  /* -----------------------------------------
     VALIDATE OPTIONAL BUDGET
  ----------------------------------------- */

  let budget = null;


  if (
    budget_price !== undefined
  ) {

    budget =
      Number(
        budget_price
      );


    if (
      !Number.isFinite(budget) ||
      budget <= 0
    ) {

      return res
        .status(400)
        .json({
          error:
            "budget_price must be greater than 0"
        });
    }
  }


  try {

    /* -----------------------------------------
       CHECK DEMAND EXISTS
    ----------------------------------------- */

    const [existing] =
      await pool.query(
        `
        SELECT *
        FROM demands
        WHERE id = ?
        `,
        [
          demandId
        ]
      );


    if (
      existing.length === 0
    ) {

      return res
        .status(404)
        .json({
          error:
            "Demand not found"
        });
    }


    /* -----------------------------------------
       UPDATE DEMAND
    ----------------------------------------- */

    await pool.query(
      `
      UPDATE demands

      SET

        status =
          COALESCE(
            ?,
            status
          ),

        quantity_needed =
          COALESCE(
            ?,
            quantity_needed
          ),

        budget_price =
          COALESCE(
            ?,
            budget_price
          )

      WHERE id = ?
      `,
      [
        status ?? null,
        quantity,
        budget,
        demandId
      ]
    );


    /* -----------------------------------------
       RETURN UPDATED DEMAND
    ----------------------------------------- */

    const [rows] =
      await pool.query(
        `
        SELECT *
        FROM demands
        WHERE id = ?
        `,
        [
          demandId
        ]
      );


    res.json(
      rows[0]
    );


  } catch (err) {

    console.error(
      "Update demand error:",
      err
    );


    res
      .status(500)
      .json({
        error:
          err.message
      });
  }
});


module.exports = router;