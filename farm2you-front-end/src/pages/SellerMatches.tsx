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

import farmerProduce from
  "../assets/images/farmer-produce.jpg";


// MySQL DECIMAL values can arrive
// in React as either numbers or strings.
type NumericValue =
  number | string;


/* =====================================
   MATCH TYPE

   These fields come from:

   GET /api/matches?producer_id=...
===================================== */

interface SellerMatch {
  id: number;

  score: NumericValue;

  distance_km: NumericValue;

  transport_cost: NumericValue;

  price_difference: NumericValue;

  status: string;


  // SELLER

  producer_id: number;

  producer_name: string;

  producer_location: string;


  // LISTING

  listing_id: number;

  available_qty: NumericValue;

  seller_price: NumericValue;

  image_data: string | null;


  // BUYER

  buyer_id: number;

  buyer_name: string;

  buyer_location: string;

  buyer_contact: string;


  // BUYER NEED

  demand_id: number;

  demanded_qty: NumericValue;

  buyer_budget: NumericValue;


  // PRODUCT

  product_id: number;

  product_name: string;

  unit: string;
}


function SellerMatches() {
  const navigate =
    useNavigate();


  /* =====================================
     STATE
  ===================================== */

  const [
    matches,
    setMatches,
  ] = useState<SellerMatch[]>([]);


  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /* =====================================
     LOAD FARMER'S MATCHES
  ===================================== */

  useEffect(() => {
    const producerId =
      Number(
        localStorage.getItem(
          "producerId"
        )
      );


    /*
      If the farmer has not created
      their producer profile yet,
      send them to setup.
    */

    if (!producerId) {
      navigate(
        "/seller/setup"
      );

      return;
    }


    const loadMatches =
      async () => {
        try {
          setLoading(true);

          setError("");


          /*
            Ask the matching API for
            matches belonging to this
            particular producer.
          */

          const data =
            await getMatches({
              producerId,
            });


          setMatches(
            data.matches || []
          );

        } catch (error) {
          console.error(
            "Could not load buyer matches:",
            error
          );


          setError(
            error instanceof Error
              ? error.message
              : "Could not load buyer matches."
          );

        } finally {
          setLoading(false);
        }
      };


    loadMatches();

  }, [navigate]);


  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <main className="matching-page">

        <section className="need-header">

          <p>
            SEARCHING FOR BUYERS
          </p>


          <h1>
            Finding buyers
            <br />
            for your produce...
          </h1>


          <span>
            We're checking active buyer
            needs against your listings.
          </span>

        </section>

      </main>
    );
  }


  /* =====================================
     ERROR
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
            your buyer matches.
          </h1>


          <span>
            {error}
          </span>


          <br />
          <br />


          <button
            type="button"
            className="find-match-button"

            onClick={() =>
              navigate(
                "/seller"
              )
            }
          >
            Back to My Produce
          </button>

        </section>

      </main>
    );
  }


  /* =====================================
     NO MATCHES
  ===================================== */

  if (matches.length === 0) {
    return (
      <main className="matching-page">

        <section className="need-header">

          <p>
            NO BUYER MATCHES YET
          </p>


          <h1>
            We're still looking
            for the right buyer.
          </h1>


          <span>
            When a buyer needs produce
            that matches what you have,
            they will appear here.
          </span>


          <br />
          <br />


          <button
            type="button"
            className="find-match-button"

            onClick={() =>
              navigate(
                "/seller"
              )
            }
          >
            Add More Produce
          </button>

        </section>

      </main>
    );
  }


  /* =====================================
     CURRENT MATCH
  ===================================== */

  const match =
    matches[currentIndex];


  /*
    Seller has skipped every match.
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
            your buyer matches.
          </h1>


          <span>
            Add more produce or check
            again when new buyer needs
            are posted.
          </span>


          <br />
          <br />


          <button
            type="button"
            className="find-match-button"

            onClick={() =>
              navigate(
                "/seller"
              )
            }
          >
            Back to My Produce
          </button>

        </section>

      </main>
    );
  }


  /* =====================================
     CONVERT MYSQL VALUES TO NUMBERS
  ===================================== */

  const score =
    Number(
      match.score
    );


  const distance =
    Number(
      match.distance_km
    );


  const delivery =
    Number(
      match.transport_cost
    );


  const buyerBudget =
    Number(
      match.buyer_budget
    );


  const sellerPrice =
    Number(
      match.seller_price
    );


  const buyerQuantity =
    Number(
      match.demanded_qty
    );


  const availableQuantity =
    Number(
      match.available_qty
    );


  /* =====================================
     PRICE DIFFERENCE
  ===================================== */

  const priceDifference =
    buyerBudget -
    sellerPrice;


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
     CHOOSE BUYER
  ===================================== */

  const handleChoose = () => {
    alert(
      `It's a match!\n\n` +
      `${match.buyer_name}\n` +
      `Needs: ${buyerQuantity} ${match.unit} of ${match.product_name}\n` +
      `Budget: N$${buyerBudget.toFixed(2)}/${match.unit}\n` +
      `Contact: ${match.buyer_contact}`
    );
  };


  return (
    <main className="match-results-page">


      {/* =================================
          HEADER
      ================================= */}

      <div className="match-results-header">

        <div>

          <p>
            BUYERS WHO NEED YOUR PRODUCE
          </p>


          <h1>
            You have a match!
          </h1>


          <span>
            Buyers are ranked using
            product, quantity, price
            and distance.
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
          TINDER-STYLE MATCH CARD
      ================================= */}

      <section className="match-card">


        {/* IMAGE */}

        <div className="match-image">

          <img
            src={
              match.image_data ||
              farmerProduce
            }

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
            MATCH DETAILS
        ================================= */}

        <div className="match-content">


          <p className="match-category">
            BUYER NEEDS THIS
          </p>


          <h2>
            {match.product_name}
          </h2>


          <h3>
            {match.buyer_name}
          </h3>


          <p className="match-location">

            📍
            {" "}
            {match.buyer_location}

            {" • "}

            {distance.toFixed(1)}
            {" "}
            km away

          </p>



          {/* =================================
              MAIN MATCH INFORMATION
          ================================= */}

          <div className="match-information">


            {/* BUYER QUANTITY */}

            <div className="match-stat">

              <span>
                BUYER NEEDS
              </span>


              <strong>

                {buyerQuantity}
                {" "}
                {match.unit}

              </strong>

            </div>



            {/* BUYER BUDGET */}

            <div className="match-stat">

              <span>
                BUYER BUDGET
              </span>


              <strong>

                N$
                {buyerBudget.toFixed(2)}
                /
                {match.unit}

              </strong>

            </div>



            {/* DISTANCE */}

            <div className="match-stat">

              <span>
                DISTANCE
              </span>


              <strong>

                {distance.toFixed(1)}
                {" "}
                km

              </strong>

            </div>

          </div>



          {/* =================================
              SELLER VS BUYER
          ================================= */}

          <div className="budget-comparison">


            {/* YOUR SUPPLY */}

            <div>

              <span>
                You Have
              </span>


              <strong>

                {availableQuantity}
                {" "}
                {match.unit}

              </strong>

            </div>



            {/* YOUR PRICE */}

            <div>

              <span>
                Your Price
              </span>


              <strong>

                N$
                {sellerPrice.toFixed(2)}
                /
                {match.unit}

              </strong>

            </div>



            {/* PRICE FIT */}

            <div className="saving">

              <span>
                Price Fit
              </span>


              <strong>

                {priceDifference >= 0
                  ? `Buyer can pay N$${priceDifference.toFixed(
                      2
                    )} more`
                  : `N$${Math.abs(
                      priceDifference
                    ).toFixed(
                      2
                    )} above buyer budget`
                }

              </strong>

            </div>

          </div>



          {/* =================================
              DELIVERY INFORMATION
          ================================= */}

          <div
            className="match-stat"
            style={{
              marginTop: "15px",
            }}
          >

            <span>
              ESTIMATED DELIVERY
            </span>


            <strong>

              ~N$
              {delivery.toFixed(2)}

            </strong>

          </div>



          {/* =================================
              ACTION BUTTONS
          ================================= */}

          <div className="match-actions">


            <button
              type="button"

              className="skip-button"

              onClick={
                handleSkip
              }
            >

              ✕

              <span>
                Skip
              </span>

            </button>


            <button
              type="button"

              className="choose-button"

              onClick={
                handleChoose
              }
            >

              ✓

              <span>
                Choose Buyer
              </span>

            </button>

          </div>


        </div>

      </section>

    </main>
  );
}


export default SellerMatches;