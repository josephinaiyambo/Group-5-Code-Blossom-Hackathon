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
  createProducer,
} from "../api/api";


function SellerSetup() {
  const navigate =
    useNavigate();


  /* =====================================
     FORM STATE
  ===================================== */

  const [name, setName] =
    useState("");

  const [type, setType] =
    useState<
      | "individual"
      | "cooperative"
      | "company"
      | "farm"
    >("farm");

  const [location, setLocation] =
    useState("Windhoek");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState(
      localStorage.getItem(
        "userEmail"
      ) || ""
    );

  const [loading, setLoading] =
    useState(false);


  /* =====================================
     CREATE PRODUCER / FARMER
  ===================================== */

  const handleSubmit =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();


      try {
        setLoading(true);


        const producer =
          await createProducer({
            name,
            type,
            location,

            contact_phone:
              phone,

            contact_email:
              email,
          });


        /*
          Save the database producer ID.

          SellerDashboard needs this
          when creating a listing.
        */

        localStorage.setItem(
          "producerId",
          String(producer.id)
        );


        localStorage.setItem(
          "producerName",
          producer.name
        );


        localStorage.setItem(
          "producerLocation",
          producer.location
        );


        /*
          Producer now exists in MySQL.

          Send them to their dashboard.
        */

        navigate(
          "/seller"
        );

      } catch (error) {
        console.error(
          "Could not create producer:",
          error
        );


        alert(
          error instanceof Error
            ? error.message
            : "Could not create seller profile."
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
            FARMER PROFILE
          </p>

          <h1>
            Tell us about your farm
          </h1>

          <span>
            We'll use this information
            when matching your produce
            with buyers.
          </span>

        </div>


        <form
          onSubmit={handleSubmit}
        >


          {/* FARM NAME */}

          <div className="form-group">

            <label>
              Farm / Producer Name
            </label>

            <input
              type="text"
              placeholder="e.g. Green Valley Farm"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
            />

          </div>


          {/* PRODUCER TYPE */}

          <div className="form-group">

            <label>
              Producer Type
            </label>

            <select
              value={type}

              onChange={(e) =>
                setType(
                  e.target.value as
                    | "individual"
                    | "cooperative"
                    | "company"
                    | "farm"
                )
              }
            >

              <option value="farm">
                Farm
              </option>

              <option value="individual">
                Individual Farmer
              </option>

              <option value="cooperative">
                Cooperative
              </option>

              <option value="company">
                Company
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


          {/* PHONE */}

          <div className="form-group">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="+264 81 123 4567"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
            />

          </div>


          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="farmer@example.com"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

          </div>


          {/* SUBMIT */}

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Creating Farm Profile..."
              : "Continue to My Produce →"}

          </button>

        </form>

      </div>

    </div>
  );
}


export default SellerSetup;