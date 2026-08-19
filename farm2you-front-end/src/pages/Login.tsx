import { useState } from "react";
import type { FormEvent } from "react";

import {
  useNavigate,
} from "react-router-dom";


function Login() {
  const navigate = useNavigate();


  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState<"buyer" | "seller">(
      "buyer"
    );


  /* =====================================
     LOGIN
  ===================================== */

  const handleLogin = (
    e: FormEvent
  ) => {
    e.preventDefault();


    /*
      TEMPORARY HACKATHON LOGIN

      We do not have a real authentication
      backend yet, so for now we simply
      remember the selected role and email.
    */

    localStorage.setItem(
      "userRole",
      role
    );

    localStorage.setItem(
      "userEmail",
      email
    );


    /*
      Clear old profile/matching information.

      This prevents a previous buyer or seller
      profile from accidentally being reused.
    */

    localStorage.removeItem(
      "buyerId"
    );

    localStorage.removeItem(
      "buyerName"
    );

    localStorage.removeItem(
      "buyerLocation"
    );


    localStorage.removeItem(
      "producerId"
    );

    localStorage.removeItem(
      "producerName"
    );

    localStorage.removeItem(
      "producerLocation"
    );


    localStorage.removeItem(
      "currentDemandId"
    );

    localStorage.removeItem(
      "currentBuyerNeed"
    );


    /* =====================================
       SEND USER TO PROFILE SETUP
    ===================================== */

    if (role === "buyer") {

      navigate(
        "/buyer/setup"
      );

    } else {

      navigate(
        "/seller/setup"
      );

    }
  };


  return (
    <div className="login-page">

      <div className="login-card">


        {/* =================================
            HEADER
        ================================= */}

        <div className="login-heading">

          <p>
            WELCOME TO MARKET ACCESS
          </p>


          <h1>
            Login
          </h1>


          <span>
            Connect with farmers and buyers
            across Namibia and find the right
            agricultural match.
          </span>

        </div>


        {/* =================================
            LOGIN FORM
        ================================= */}

        <form
          onSubmit={handleLogin}
        >


          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email
            </label>


            <input
              type="email"

              placeholder="you@example.com"

              value={email}

              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }

              required
            />

          </div>



          {/* PASSWORD */}

          <div className="form-group">

            <label>
              Password
            </label>


            <input
              type="password"

              placeholder="Enter your password"

              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }

              required
            />

          </div>



          {/* ROLE */}

          <div className="form-group">

            <label>
              I am a
            </label>


            <select
              value={role}

              onChange={(e) =>
                setRole(
                  e.target.value as
                    | "buyer"
                    | "seller"
                )
              }
            >

              <option value="buyer">
                Buyer
              </option>

              <option value="seller">
                Seller / Farmer
              </option>

            </select>

          </div>



          {/* SUBMIT */}

          <button
            className="login-submit"
            type="submit"
          >
            Continue
          </button>

        </form>

      </div>

    </div>
  );
}


export default Login;