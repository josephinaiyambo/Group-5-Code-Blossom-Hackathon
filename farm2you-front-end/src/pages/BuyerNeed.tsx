import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createDemand,
  getProducts,
  runMatching,
} from "../api/api";

import type {
  Product,
} from "../api/api";


function BuyerNeed() {
  const navigate = useNavigate();


  /* =====================================
     STATE
  ===================================== */

  const [products, setProducts] =
    useState<Product[]>([]);

  const [productId, setProductId] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [urgency, setUrgency] =
    useState("today");

  const [loading, setLoading] =
    useState(false);


  /* =====================================
     BUYER LOCATION

     Comes from BuyerSetup.tsx
  ===================================== */

  const location =
    localStorage.getItem(
      "buyerLocation"
    ) || "";


  /* =====================================
     LOAD PRODUCTS FROM DATABASE
  ===================================== */

  useEffect(() => {
    const buyerId =
      localStorage.getItem(
        "buyerId"
      );


    // Buyer has not completed profile setup
    if (!buyerId) {
      navigate(
        "/buyer/setup"
      );

      return;
    }


    const loadProducts =
      async () => {
        try {
          const data =
            await getProducts();

          setProducts(data);

        } catch (error) {
          console.error(error);

          alert(
            "Could not load products."
          );
        }
      };


    loadProducts();

  }, [navigate]);


  /* =====================================
     FIND SELECTED PRODUCT

     This gives us:
     name
     unit
     category
  ===================================== */

  const selectedProduct =
    useMemo(
      () =>
        products.find(
          (product) =>
            String(product.id) ===
            productId
        ),

      [
        products,
        productId,
      ]
    );


  /* =====================================
     SUBMIT BUYER NEED
  ===================================== */

  const handleSubmit =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();


      const buyerId =
        Number(
          localStorage.getItem(
            "buyerId"
          )
        );


      if (!buyerId) {
        navigate(
          "/buyer/setup"
        );

        return;
      }


      if (!productId) {
        alert(
          "Please select a product."
        );

        return;
      }


      if (
        Number(quantity) <= 0
      ) {
        alert(
          "Quantity must be greater than 0."
        );

        return;
      }


      if (
        Number(budget) <= 0
      ) {
        alert(
          "Budget must be greater than 0."
        );

        return;
      }


      try {
        setLoading(true);


        /* =================================
           STEP 1:
           CREATE DEMAND IN MYSQL
        ================================= */

        const demand =
          await createDemand({
            buyer_id:
              buyerId,

            product_id:
              Number(productId),

            quantity_needed:
              Number(quantity),

            budget_price:
              Number(budget),

            frequency:
              urgency === "week"
                ? "weekly"
                : "once",
          });


        /* =================================
           STEP 2:
           REMEMBER WHICH DEMAND
           WE ARE MATCHING
        ================================= */

        localStorage.setItem(
          "currentDemandId",
          String(demand.id)
        );


        localStorage.setItem(
          "currentBuyerNeed",

          JSON.stringify({
            product_id:
              Number(productId),

            product_name:
              selectedProduct?.name,

            quantity:
              Number(quantity),

            budget:
              Number(budget),

            unit:
              selectedProduct?.unit,

            location,

            urgency,
          })
        );


        /* =================================
           STEP 3:
           RUN MATCHING ENGINE
        ================================= */

        await runMatching(
          demand.id
        );


        /* =================================
           STEP 4:
           GO TO TINDER MATCH CARDS
        ================================= */

        navigate(
          "/buyer/matches"
        );

      } catch (error) {
        console.error(error);

        alert(
          error instanceof Error
            ? error.message
            : "Could not find matches."
        );

      } finally {
        setLoading(false);
      }
    };


  return (
    <main className="matching-page">


      {/* =================================
          LEFT SIDE
      ================================= */}

      <section className="need-header">

        <p>
          FIND YOUR SUPPLIER
        </p>


        <h1>
          What do you need
          <br />
          right now?
        </h1>


        <span>
          Tell us what you need and
          we'll find the closest farmers
          with the best match.
        </span>

      </section>


      {/* =================================
          FORM
      ================================= */}

      <section className="need-card">

        <form
          onSubmit={handleSubmit}
        >


          {/* PRODUCT */}

          <div className="form-group">

            <label>
              What produce do you need?
            </label>


            <select
              value={productId}

              onChange={(e) =>
                setProductId(
                  e.target.value
                )
              }

              required
            >

              <option value="">
                Select produce
              </option>


              {products.map(
                (product) => (

                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>

                )
              )}

            </select>

          </div>


          {/* QUANTITY + UNIT */}

          <div className="need-row">


            <div className="form-group">

              <label>
                How much?
              </label>


              <input
                type="number"

                min="1"

                placeholder="100"

                value={quantity}

                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }

                required
              />

            </div>


            <div className="form-group">

              <label>
                Unit
              </label>


              <input
                value={
                  selectedProduct?.unit ||
                  ""
                }

                placeholder="kg"

                readOnly
              />

            </div>

          </div>


          {/* BUDGET */}

          <div className="form-group">

            <label>
              Maximum price per unit
            </label>


            <div className="money-input">

              <span>
                N$
              </span>


              <input
                type="number"

                min="0.01"

                step="0.01"

                placeholder="30"

                value={budget}

                onChange={(e) =>
                  setBudget(
                    e.target.value
                  )
                }

                required
              />

            </div>

          </div>


          {/* LOCATION */}

          <div className="form-group">

            <label>
              Your location
            </label>


            <input
              type="text"

              value={location}

              placeholder="Complete your buyer profile"

              readOnly
            />

          </div>


          {/* URGENCY */}

          <div className="form-group">

            <label>
              When do you need it?
            </label>


            <div className="urgency-options">


              <button
                type="button"

                className={
                  urgency === "now"
                    ? "urgency active"
                    : "urgency"
                }

                onClick={() =>
                  setUrgency("now")
                }
              >
                Now
              </button>


              <button
                type="button"

                className={
                  urgency === "today"
                    ? "urgency active"
                    : "urgency"
                }

                onClick={() =>
                  setUrgency(
                    "today"
                  )
                }
              >
                Today
              </button>


              <button
                type="button"

                className={
                  urgency === "week"
                    ? "urgency active"
                    : "urgency"
                }

                onClick={() =>
                  setUrgency(
                    "week"
                  )
                }
              >
                This Week
              </button>


            </div>

          </div>


          {/* SUBMIT */}

          <button
            type="submit"

            className="find-match-button"

            disabled={loading}
          >

            {loading
              ? "Finding matches..."
              : "Find My Matches →"}

          </button>


        </form>

      </section>

    </main>
  );
}


export default BuyerNeed;