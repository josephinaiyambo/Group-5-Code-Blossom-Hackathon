import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getMatches,
} from "../api/api";

import tomatoes from "../assets/images/tomatoes.jpg";
import farmerProduce from "../assets/images/farmer-produce.jpg";


/* =====================================
   MATCH TYPE

   These fields come from:
   GET /api/matches
===================================== */

interface Match {
  id: number;

  score: number;

  distance_km: number;

  transport_cost: number;

  price_difference: number;

  status: string;


  producer_id: number;

  producer_name: string;

  producer_location: string;

  producer_phone: string | null;

  producer_email: string | null;


  listing_id: number;

  available_qty: number;

  seller_price: number;

  image_data: string | null;


  buyer_id: number;

  buyer_name: string;

  buyer_location: string;

  buyer_contact: string;


  demand_id: number;

  demanded_qty: number;

  buyer_budget: number;


  product_id: number;

  product_name: string;

  unit: string;
}


function MatchResults() {
  const navigate = useNavigate();


  /* =====================================
     STATE
  ===================================== */

  const [matches, setMatches] =
    useState<Match[]>([]);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =====================================
     LOAD REAL MATCHES
  ===================================== */

  useEffect(() => {
    const demandId =
      Number(
        localStorage.getItem(
          "currentDemandId"
        )
      );


    /*
      If there is no demand ID,
      the buyer hasn't submitted
      a need yet.
    */

    if (!demandId) {
      navigate(
        "/buyer/need"
      );

      return;
    }


    const loadMatches =
      async () => {
        try {
          setLoading(true);

          setError("");


          /*
            Only retrieve matches
            for the demand that
            this buyer just created.
          */

          const data =
            await getMatches({
              demandId,
            });


          setMatches(
            data.matches || []
          );

        } catch (error) {
          console.error(
            "Could not load matches:",
            error
          );


          setError(
            error instanceof Error
              ? error.message
              : "Could not load matches."
          );

        } finally {
          setLoading(false);
        }
      };


    loadMatches();

  }, [navigate]);


  /* =====================================
     LOADING SCREEN
  ===================================== */

  if (loading) {
    return (
      <main className="matching-page">

        <section className="need-header">

          <p>
            SEARCHING THE MARKET
          </p>

          <h1>
            Finding your
            <br />
            best matches...
          </h1>

          <span>
            We're comparing product,
            quantity, price and distance.
          </span>

        </section>

      </main>
    );
  }


  /* =====================================
     ERROR SCREEN
  ===================================== */

  if (error) {
    return (
      <main className="matching-page">

        <section className="need-header">

          <p>
            SOMETHING WENT WRONG
          </p>

          <h1>
            We couldn't load
            your matches.
          </h1>

          <span>
            {error}
          </span>

          <br />
          <br />

          <button
            className="find-match-button"
            onClick={() =>
              navigate(
                "/buyer/need"
              )
            }
          >
            Try Again
          </button>

        </section>

      </main>
    );
  }


  /* =====================================
     NO MATCHES FOUND
  ===================================== */

  if (matches.length === 0) {
    return (
      <main className="matching-page">

        <section className="need-header">

          <p>
            NO MATCH YET
          </p>

          <h1>
            No farmers matched
            your need yet.
          </h1>

          <span>
            Try increasing your budget,
            changing the quantity, or
            searching again later.
          </span>

          <br />
          <br />

          <button
            className="find-match-button"
            onClick={() =>
              navigate(
                "/buyer/need"
              )
            }
          >
            Change My Need
          </button>

        </section>

      </main>
    );
  }


  /* =====================================
     CURRENT TINDER CARD
  ===================================== */

  const match =
    matches[currentIndex];


  /*
    The buyer has skipped
    every available match.
  */

  if (!match) {
    return (
      <main className="matching-page">

        <section className="need-header">

          <p>
            THAT'S ALL
          </p>

          <h1>
            You've viewed all
            your matches.
          </h1>

          <span>
            You can create another need
            to search again.
          </span>

          <br />
          <br />

          <button
            className="find-match-button"
            onClick={() =>
              navigate(
                "/buyer/need"
              )
            }
          >
            Find Another Match
          </button>

        </section>

      </main>
    );
  }


  /* =====================================
     NUMERIC VALUES

     MySQL DECIMAL values can sometimes
     arrive as strings, so convert them.
  ===================================== */

  const score =
    Number(match.score);

  const distance =
    Number(
      match.distance_km
    );

  const delivery =
    Number(
      match.transport_cost
    );

  const sellerPrice =
    Number(
      match.seller_price
    );

  const buyerBudget =
    Number(
      match.buyer_budget
    );

  const availableQuantity =
    Number(
      match.available_qty
    );


  const budgetDifference =
    buyerBudget -
    sellerPrice;


  /* =====================================
     IMAGE

     Use seller's uploaded image if one
     exists. Otherwise use fallback.
  ===================================== */

  const productImage =
    match.image_data ||
    (
      match.product_name
        .toLowerCase()
        .includes("tomato")
        ? tomatoes
        : farmerProduce
    );


  /* =====================================
     SKIP
  ===================================== */

  const handleSkip = () => {
    setCurrentIndex(
      (previous) =>
        previous + 1
    );
  };


  /* =====================================
     CHOOSE MATCH
  ===================================== */

  const handleChoose = () => {
    const contact =
      match.producer_phone ||
      match.producer_email ||
      "Contact details unavailable";


    alert(
      `It's a match!\n\n` +
      `${match.producer_name}\n` +
      `${match.product_name}\n` +
      `Contact: ${contact}`
    );
  };


  return (
    <main className="match-results-page">


      {/* =================================
          PAGE HEADER
      ================================= */}

      <div className="match-results-header">

        <div>

          <p>
            YOUR BEST MATCHES
          </p>


          <h1>
            We found a match!
          </h1>


          <span>
            Ranked using product,
            quantity, price and distance.
          </span>

        </div>


        <div className="match-counter">

          {currentIndex + 1}
          {" "}
          of
          {" "}
          {matches.length}

        </div>

      </div>


      {/* =================================
          MATCH CARD
      ================================= */}

      <section className="match-card">


        {/* IMAGE */}

        <div className="match-image">

          <img
            src={productImage}
            alt={
              match.product_name
            }
          />


          <div className="match-score">

            {Math.round(score)}
            % MATCH

          </div>

        </div>



        {/* =================================
            CARD INFORMATION
        ================================= */}

        <div className="match-content">


          <p className="match-category">
            AVAILABLE NOW
          </p>


          <h2>
            {match.product_name}
          </h2>


          <h3>
            {match.producer_name}
          </h3>


          <p className="match-location">

            📍
            {" "}
            {match.producer_location}

            {" • "}

            {distance.toFixed(1)}
            {" "}
            km away

          </p>



          {/* =================================
              QUICK STATS
          ================================= */}

          <div className="match-information">


            {/* QUANTITY */}

            <div className="match-stat">

              <span>
                AVAILABLE
              </span>

              <strong>

                {availableQuantity}
                {" "}
                {match.unit}

              </strong>

            </div>



            {/* PRICE */}

            <div className="match-stat">

              <span>
                FARMER PRICE
              </span>

              <strong>

                N$
                {sellerPrice.toFixed(2)}
                /
                {match.unit}

              </strong>

            </div>



            {/* DELIVERY */}

            <div className="match-stat">

              <span>
                EST. DELIVERY
              </span>

              <strong>

                ~N$
                {delivery.toFixed(2)}

              </strong>

            </div>

          </div>



          {/* =================================
              BUYER NEED
          ================================= */}

          <div className="budget-comparison">


            <div>

              <span>
                You Need
              </span>

              <strong>

                {match.demanded_qty}
                {" "}
                {match.unit}

              </strong>

            </div>


            <div>

              <span>
                Your Maximum
              </span>

              <strong>

                N$
                {buyerBudget.toFixed(2)}
                /
                {match.unit}

              </strong>

            </div>


            <div className="saving">

              <span>
                Price Difference
              </span>


              <strong>

                {budgetDifference >= 0
                  ? `N$${budgetDifference.toFixed(
                      2
                    )} below budget`
                  : `N$${Math.abs(
                      budgetDifference
                    ).toFixed(
                      2
                    )} above budget`
                }

              </strong>

            </div>

          </div>



          {/* =================================
              ACTIONS
          ================================= */}

          <div className="match-actions">


            <button
              type="button"
              className="skip-button"
              onClick={handleSkip}
            >

              ✕
              <span>
                Skip
              </span>

            </button>


            <button
              type="button"
              className="choose-button"
              onClick={handleChoose}
            >

              ✓
              <span>
                Choose Match
              </span>

            </button>


          </div>

        </div>

      </section>

    </main>
  );
}


export default MatchResults;