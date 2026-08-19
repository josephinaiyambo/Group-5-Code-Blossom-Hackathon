import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createBuyer,
} from "../api/api";


function BuyerSetup() {
  const navigate =
    useNavigate();


  /* =====================================
     FORM STATE
  ===================================== */

  const [name, setName] =
    useState("");

  const [type, setType] =
    useState("restaurant");

  const [location, setLocation] =
    useState("Windhoek");

  const [region, setRegion] =
    useState("Khomas");

  const [contact, setContact] =
    useState(
      localStorage.getItem(
        "userEmail"
      ) || ""
    );

  const [loading, setLoading] =
    useState(false);


  /* =====================================
     CREATE BUYER
  ===================================== */

  const handleSubmit =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();


      try {
        setLoading(true);


        const buyer =
          await createBuyer({
            name,
            type,
            location,
            region,
            contact,
          });


        /*
          IMPORTANT:

          The database gives this buyer
          a real ID.

          We keep that ID so BuyerNeed
          knows who owns the demand.
        */

        localStorage.setItem(
          "buyerId",
          String(buyer.id)
        );


        localStorage.setItem(
          "buyerName",
          buyer.name
        );


        localStorage.setItem(
          "buyerLocation",
          buyer.location
        );


        /*
          Buyer profile now exists.

          Continue to the page where they
          describe what produce they need.
        */

        navigate(
          "/buyer/need"
        );

      } catch (error) {
        console.error(
          "Could not create buyer:",
          error
        );


        alert(
          error instanceof Error
            ? error.message
            : "Could not create buyer profile."
        );

      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="login-page">

      <div className="login-card">


        {/* HEADER */}

        <div className="login-heading">

          <p>
            BUYER PROFILE
          </p>

          <h1>
            Tell us about you
          </h1>

          <span>
            This helps us find farmers
            that best match your needs.
          </span>

        </div>


        <form
          onSubmit={handleSubmit}
        >


          {/* BUSINESS NAME */}

          <div className="form-group">

            <label>
              Business or Organisation Name
            </label>

            <input
              type="text"
              placeholder="e.g. Joe's Restaurant"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
            />

          </div>


          {/* BUYER TYPE */}

          <div className="form-group">

            <label>
              Type of Buyer
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value
                )
              }
              required
            >

              <option value="restaurant">
                Restaurant
              </option>

              <option value="hotel">
                Hotel
              </option>

              <option value="school">
                School
              </option>

              <option value="retailer">
                Retailer
              </option>

              <option value="shop">
                Shop
              </option>

              <option value="wholesaler">
                Wholesaler
              </option>

              <option value="catering">
                Catering Business
              </option>

            </select>

          </div>


          {/* LOCATION */}

          <div className="form-group">

            <label>
              Town / City
            </label>

            <select
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
              required
            >

              <option value="Windhoek">
                Windhoek
              </option>

              <option value="Otjiwarongo">
                Otjiwarongo
              </option>

              <option value="Swakopmund">
                Swakopmund
              </option>

              <option value="Walvis Bay">
                Walvis Bay
              </option>

              <option value="Rundu">
                Rundu
              </option>

              <option value="Oshakati">
                Oshakati
              </option>

              <option value="Gobabis">
                Gobabis
              </option>

              <option value="Keetmanshoop">
                Keetmanshoop
              </option>

              <option value="Mariental">
                Mariental
              </option>

              <option value="Tsumeb">
                Tsumeb
              </option>

            </select>

          </div>


          {/* REGION */}

          <div className="form-group">

            <label>
              Region
            </label>

            <input
              type="text"
              placeholder="e.g. Khomas"
              value={region}
              onChange={(e) =>
                setRegion(
                  e.target.value
                )
              }
              required
            />

          </div>


          {/* CONTACT */}

          <div className="form-group">

            <label>
              Contact
            </label>

            <input
              type="text"
              placeholder="Email or phone number"
              value={contact}
              onChange={(e) =>
                setContact(
                  e.target.value
                )
              }
              required
            />

          </div>


          {/* SUBMIT */}

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Creating Profile..."
              : "Continue to Find Produce →"}

          </button>

        </form>

      </div>

    </div>
  );
}


export default BuyerSetup;