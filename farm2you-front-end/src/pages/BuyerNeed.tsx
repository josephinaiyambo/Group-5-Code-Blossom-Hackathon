import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createDemand,
  runMatching,
} from "../api/api";

function BuyerNeed() {
  const navigate = useNavigate();

  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState("today");

const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  try {
    const buyerId = Number(
      localStorage.getItem("buyerId")
    );

    if (!buyerId) {
      alert("Buyer profile not found.");
      return;
    }

    const demand = await createDemand({
      buyer_id: buyerId,
      product_id: Number(product),
      quantity_needed: Number(quantity),
      budget_price: Number(budget),

      frequency:
        urgency === "week"
          ? "weekly"
          : "once",
    });

    localStorage.setItem(
      "currentDemandId",
      String(demand.id)
    );

    localStorage.setItem(
      "currentBuyerNeed",
      JSON.stringify({
        product_id: Number(product),
        quantity,
        budget,
        location,
        urgency,
      })
    );

    await runMatching();

    navigate("/buyer/matches");

  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Could not find matches."
    );
  }
};
    // Temporary while building UI
    localStorage.setItem(
      "currentBuyerNeed",
      JSON.stringify(need)
    );

    navigate("/buyer/matches");
  };

  return (
    <main className="matching-page">

      <section className="need-header">
        <p>FIND YOUR SUPPLIER</p>

        <h1>
          What do you need
          <br />
          right now?
        </h1>

        <span>
          Tell us what you need and we'll find the
          closest farmers with the best price.
        </span>
      </section>

      <section className="need-card">

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>What produce do you need?</label>

            <input
              type="text"
              placeholder="e.g. Tomatoes"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
            />
          </div>

          <div className="need-row">

            <div className="form-group">
              <label>How much?</label>

              <input
                type="number"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Unit</label>

              <select>
                <option>kg</option>
                <option>boxes</option>
                <option>bunches</option>
                <option>bags</option>
                <option>tonnes</option>
              </select>
            </div>

          </div>

          <div className="form-group">
            <label>Maximum price per unit</label>

            <div className="money-input">
              <span>N$</span>

              <input
                type="number"
                placeholder="30"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Your location</label>

            <input
              type="text"
              placeholder="e.g. Windhoek"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>When do you need it?</label>

            <div className="urgency-options">

              <button
                type="button"
                className={
                  urgency === "now"
                    ? "urgency active"
                    : "urgency"
                }
                onClick={() => setUrgency("now")}
              >
                ⚡ Now
              </button>

              <button
                type="button"
                className={
                  urgency === "today"
                    ? "urgency active"
                    : "urgency"
                }
                onClick={() => setUrgency("today")}
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
                onClick={() => setUrgency("week")}
              >
                This Week
              </button>

            </div>
          </div>

          <button
            type="submit"
            className="find-match-button"
          >
            Find My Matches →
          </button>

        </form>

      </section>

    </main>
  );
}

export default BuyerNeed;