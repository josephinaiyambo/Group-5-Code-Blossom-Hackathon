import { Link } from "react-router-dom";

import heroImage from "../assets/images/hero.jpg";
import tomatoes from "../assets/images/tomatoes.jpg";
import broccoli from "../assets/images/broccoli.jpg";
import grain from "../assets/images/grain.jpg";

function Home() {
  return (
    <main>

      {/* =====================================
          HERO
      ===================================== */}

      <section className="hero">

        <div className="hero-text">

          <p className="hero-small">
            FRESH • LOCAL • MATCHED
          </p>

          <h1>
            The Right Produce.
            <br />
            The Right Buyer.
            <br />
            Right Now.
          </h1>

          <p className="hero-description">
            Market Access connects Namibian farmers
            with restaurants, hotels, schools, shops
            and other buyers who need their produce.
            Tell us what you have or what you need,
            and we'll find your best match.
          </p>


          <div className="hero-buttons">

            <Link
              to="/buy"
              className="primary-button"
            >
              I Need Produce
            </Link>

            <Link
              to="/sell"
              className="secondary-button"
            >
              I Have Produce
            </Link>

          </div>

        </div>


        <div className="hero-image">

          <img
            src={heroImage}
            alt="Fresh Namibian farm produce"
          />

          <div className="hero-match-badge">
            <strong>94% Match</strong>
            <span>
              Farmer ↔ Buyer
            </span>
          </div>

        </div>

      </section>



      {/* =====================================
          HOW IT WORKS
      ===================================== */}

      <section className="how-it-works">

        <div className="section-heading">

          <p>
            SMARTER MARKET ACCESS
          </p>

          <h2>
            How It Works
          </h2>

          <span>
            From available produce to the right
            customer in three simple steps.
          </span>

        </div>


        <div className="steps-grid">


          <article className="step-card">

            <div className="step-number">
              01
            </div>

            <h3>
              Tell Us What You Have
            </h3>

            <p>
              Farmers add their produce,
              quantity, price, location and
              availability.
            </p>

          </article>


          <article className="step-card">

            <div className="step-number">
              02
            </div>

            <h3>
              Buyers Post What They Need
            </h3>

            <p>
              Buyers tell us the produce they
              need, how much they need and
              their budget.
            </p>

          </article>


          <article className="step-card">

            <div className="step-number">
              03
            </div>

            <h3>
              We Find The Best Match
            </h3>

            <p>
              Market Access compares product,
              quantity, price and distance,
              then ranks the strongest matches.
            </p>

          </article>


        </div>

      </section>



      {/* =====================================
          SAMPLE MATCH
      ===================================== */}

      <section className="home-match-section">

        <div className="home-match-image">

          <img
            src={tomatoes}
            alt="Fresh tomatoes"
          />

        </div>


        <div className="home-match-content">

          <p className="hero-small">
            EXAMPLE MATCH
          </p>

          <div className="home-match-score">
            94% MATCH
          </div>

          <h2>
            Fresh Tomatoes
          </h2>

          <h3>
            Green Valley Farm
          </h3>

          <p>
            A restaurant in Windhoek needs
            100 kg of tomatoes today.
            Green Valley Farm has 120 kg
            available nearby at a price
            within the buyer's budget.
          </p>


          <div className="home-match-stats">

            <div>
              <span>
                Available
              </span>

              <strong>
                120 kg
              </strong>
            </div>


            <div>
              <span>
                Farmer Price
              </span>

              <strong>
                N$25/kg
              </strong>
            </div>


            <div>
              <span>
                Buyer Budget
              </span>

              <strong>
                N$30/kg
              </strong>
            </div>

          </div>


          <Link
            to="/buy"
            className="primary-button"
          >
            Find My Match →
          </Link>

        </div>

      </section>



      {/* =====================================
          BUYER / SELLER CTA
      ===================================== */}

      <section className="promo-section">


        {/* FARMER */}

        <div className="promo-card">

          <div className="promo-image">

            <img
              src={broccoli}
              alt="Fresh farm vegetables"
            />

          </div>


          <div className="promo-text">

            <p>
              FOR FARMERS
            </p>

            <h2>
              Have Produce
              <br />
              Ready To Sell?
            </h2>

            <span>
              List what you have and discover
              buyers who need it.
            </span>

            <Link
              to="/sell"
              className="primary-button"
            >
              Find Buyers
            </Link>

          </div>

        </div>



        {/* BUYER */}

        <div className="promo-card">

          <div className="promo-text">

            <p>
              FOR BUYERS
            </p>

            <h2>
              Need Produce
              <br />
              Right Now?
            </h2>

            <span>
              Tell us what you need and we'll
              rank nearby suppliers for you.
            </span>

            <Link
              to="/buy"
              className="primary-button"
            >
              Find Farmers
            </Link>

          </div>


          <div className="promo-image">

            <img
              src={grain}
              alt="Namibian agricultural produce"
            />

          </div>

        </div>


      </section>



      {/* =====================================
          FOOTER
      ===================================== */}

      <footer>

        <div className="footer-column">

          <h3>
            MARKET ACCESS
          </h3>

          <p>
            Connecting Namibian farmers and
            buyers through smarter agricultural
            matching.
          </p>

        </div>


        <div className="footer-column">

          <h3>
            For Buyers
          </h3>

          <Link to="/buy">
            Find Produce
          </Link>

          <Link to="/buyer/matches">
            My Matches
          </Link>

        </div>


        <div className="footer-column">

          <h3>
            For Farmers
          </h3>

          <Link to="/sell">
            Add Produce
          </Link>

          <Link to="/seller/matches">
            Buyer Matches
          </Link>

        </div>


        <div className="footer-column">

          <h3>
            Namibia
          </h3>

          <p>
            Local supply.
            <br />
            Local demand.
            <br />
            Better connections.
          </p>

        </div>

      </footer>

    </main>
  );
}

export default Home;