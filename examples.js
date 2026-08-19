require("dotenv").config();

const {
  pool,
  initTables
} = require("./db");


async function input() {

  try {

    /* =====================================================
       INITIALISE DATABASE
    ===================================================== */

    await initTables();


    /* =====================================================
       FIND TOMATO PRODUCT ID

       Do not assume Tomatoes is always ID 1.
    ===================================================== */

    const [products] =
      await pool.query(
        `
        SELECT id
        FROM products
        WHERE name = ?
        LIMIT 1
        `,
        [
          "Tomatoes"
        ]
      );


    if (
      products.length === 0
    ) {
      throw new Error(
        "Tomatoes product could not be found."
      );
    }


    const tomatoProductId =
      products[0].id;


    /* =====================================================
       BUYER 1
    ===================================================== */

    const [buyer1] =
      await pool.query(
        `
        INSERT INTO buyers
        (
          name,
          type,
          location,
          region,
          contact
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          "Hilltop Hotel",
          "hotel",
          "Windhoek",
          "Khomas",
          "+264 81 000 1111"
        ]
      );


    /* =====================================================
       BUYER 2
    ===================================================== */

    const [buyer2] =
      await pool.query(
        `
        INSERT INTO buyers
        (
          name,
          type,
          location,
          region,
          contact
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          "Namib Grill Restaurant",
          "restaurant",
          "Windhoek",
          "Khomas",
          "+264 81 000 2222"
        ]
      );


    /* =====================================================
       BUYER 3
    ===================================================== */

    const [buyer3] =
      await pool.query(
        `
        INSERT INTO buyers
        (
          name,
          type,
          location,
          region,
          contact
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          "Otjomuise Primary School",
          "school",
          "Windhoek",
          "Khomas",
          "+264 81 000 3333"
        ]
      );


    /* =====================================================
       BUYER 4
    ===================================================== */

    const [buyer4] =
      await pool.query(
        `
        INSERT INTO buyers
        (
          name,
          type,
          location,
          region,
          contact
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          "Corner Shop Supermarket",
          "retailer",
          "Windhoek",
          "Khomas",
          "+264 81 000 4444"
        ]
      );


    /* =====================================================
       DEMANDS
    ===================================================== */

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
      VALUES (?, ?, ?, ?, ?, 'open')
      `,
      [
        buyer1.insertId,
        tomatoProductId,
        300,
        10,
        "monthly"
      ]
    );


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
      VALUES (?, ?, ?, ?, ?, 'open')
      `,
      [
        buyer2.insertId,
        tomatoProductId,
        150,
        9.5,
        "weekly"
      ]
    );


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
      VALUES (?, ?, ?, ?, ?, 'open')
      `,
      [
        buyer3.insertId,
        tomatoProductId,
        80,
        8.5,
        "weekly"
      ]
    );


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
      VALUES (?, ?, ?, ?, ?, 'open')
      `,
      [
        buyer4.insertId,
        tomatoProductId,
        500,
        9,
        "monthly"
      ]
    );


    /* =====================================================
       TRANSPORT PROVIDERS
    ===================================================== */

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
        "Windhoek Freight Co",
        "Khomas",
        5.5,
        "+264 81 500 1000"
      ]
    );


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
        "Central Namibia Logistics",
        "Otjozondjupa",
        6.0,
        "+264 81 500 2000"
      ]
    );


    console.log(
      "✅ Demo input complete."
    );

    console.log(
      "4 buyers added."
    );

    console.log(
      "4 tomato demands added."
    );

    console.log(
      "2 transport providers added."
    );


  } catch (error) {

    console.error(
      "❌ Input failed:",
      error.message
    );

    process.exitCode = 1;

  } finally {

    /*
      Close MySQL cleanly instead of
      immediately forcing process.exit().
    */

    await pool.end();
  }
}


input();