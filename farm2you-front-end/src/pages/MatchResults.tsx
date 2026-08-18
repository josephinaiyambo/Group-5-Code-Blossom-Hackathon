import { useState } from "react";
import tomatoes from "../assets/images/tomatoes.jpg";
import farmerProduce from "../assets/images/farmer-produce.jpg";

const matches = [
  {
    id: 1,
    score: 94,
    product: "Fresh Tomatoes",
    seller: "Green Valley Farm",
    location: "Windhoek",
    distance: 12,
    quantity: "120 kg",
    price: 25,
    delivery: 80,
    image: tomatoes,
  },
  {
    id: 2,
    score: 88,
    product: "Fresh Tomatoes",
    seller: "Sunrise Produce",
    location: "Okahandja",
    distance: 31,
    quantity: "250 kg",
    price: 23,
    delivery: 145,
    image: farmerProduce,
  },
];

function MatchResults() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const match = matches[currentIndex];

  const handleSkip = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("No more matches available.");
    }
  };

  const handleChoose = () => {
    alert(
      `Match selected: ${match.seller}`
    );
  };

  if (!match) {
    return (
      <main className="matching-page">
        <h1>No more matches</h1>
      </main>
    );
  }

  return (
    <main className="match-results-page">

      <div className="match-results-header">

        <div>
          <p>YOUR BEST MATCHES</p>

          <h1>
            We found a match!
          </h1>

          <span>
            Ranked using price, distance and availability.
          </span>
        </div>

        <div className="match-counter">
          {currentIndex + 1} of {matches.length}
        </div>

      </div>

      <section className="match-card">

        <div className="match-image">

          <img
            src={match.image}
            alt={match.product}
          />

          <div className="match-score">
            {match.score}% MATCH
          </div>

        </div>

        <div className="match-content">

          <p className="match-category">
            AVAILABLE NOW
          </p>

          <h2>
            {match.product}
          </h2>

          <h3>
            {match.seller}
          </h3>

          <p className="match-location">
            📍 {match.location} • {match.distance} km away
          </p>


          <div className="match-information">

            <div className="match-stat">
              <span>AVAILABLE</span>

              <strong>
                {match.quantity}
              </strong>
            </div>

            <div className="match-stat">
              <span>PRICE</span>

              <strong>
                N${match.price}/kg
              </strong>
            </div>

            <div className="match-stat">
              <span>DELIVERY</span>

              <strong>
                ~N${match.delivery}
              </strong>
            </div>

          </div>


          <div className="budget-comparison">

            <div>
              <span>Your maximum price</span>
              <strong>N$30/kg</strong>
            </div>

            <div>
              <span>Farmer's price</span>
              <strong>N${match.price}/kg</strong>
            </div>

            <div className="saving">
              <span>Difference</span>
              <strong>
                N${30 - match.price}/kg below budget
              </strong>
            </div>

          </div>


          <div className="match-actions">

            <button
              className="skip-button"
              onClick={handleSkip}
            >
              ✕
              <span>Skip</span>
            </button>

            <button
              className="choose-button"
              onClick={handleChoose}
            >
              ✓
              <span>Choose Match</span>
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}

export default MatchResults;