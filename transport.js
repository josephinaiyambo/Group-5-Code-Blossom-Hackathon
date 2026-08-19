const express = require("express");

const router = express.Router();

const {
  pool
} = require("./db");


/* =========================================================
   POST /transport-providers

   Create a transport provider
========================================================= */

router.post("/", async (req, res) => {

  const {
    name,
    coverage_area,
    cost_per_km,
    contact
  } = req.body;


  /* -----------------------------------------
     REQUIRED FIELDS
  ----------------------------------------- */

  if (
    !name ||
    !coverage_area ||
    cost_per_km === undefined ||
    !contact
  ) {

    return res
      .status(400)
      .json({
        error:
          "name, coverage_area, cost_per_km, and contact are all required"
      });
  }


  /* -----------------------------------------
     CONVERT COST TO NUMBER
  ----------------------------------------- */

  const costPerKm =
    Number(
      cost_per_km
    );


  if (
    !Number.isFinite(costPerKm) ||
    costPerKm <= 0
  ) {

    return res
      .status(400)
      .json({
        error:
          "cost_per_km must be greater than 0"
      });
  }


  try {

    /* -----------------------------------------
       CREATE PROVIDER
    ----------------------------------------- */

    const [result] =
      await pool.query(
        `
        INSERT INTO transport_providers
        (
          name,
          coverage_area,
          cost_per_km,
          contact
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          String(name).trim(),

          String(
            coverage_area
          ).trim(),

          costPerKm,

          String(contact).trim()
        ]
      );


    /* -----------------------------------------
       RETURN CREATED PROVIDER
    ----------------------------------------- */

    const [rows] =
      await pool.query(
        `
        SELECT *
        FROM transport_providers
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
      "Create transport provider error:",
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
   GET /transport-providers

   Optional:
   /transport-providers?coverage_area=Khomas
========================================================= */

router.get("/", async (req, res) => {

  const {
    coverage_area
  } = req.query;


  let query =
    `
    SELECT *
    FROM transport_providers
    WHERE 1 = 1
    `;


  const params = [];


  if (
    coverage_area
  ) {

    query +=
      " AND coverage_area = ?";


    params.push(
      coverage_area
    );
  }


  query +=
    " ORDER BY name";


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
      "Get transport providers error:",
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