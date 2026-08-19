import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

function NavBar() {
  /*
    useLocation makes the navbar re-render
    whenever the route changes.

    This is useful after login because
    userRole is stored in localStorage.
  */
  useLocation();

  const navigate = useNavigate();

  const role =
    localStorage.getItem("userRole");


  /* =====================================
     LOGOUT
  ===================================== */

  const handleLogout = () => {
    // General login information
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");


    // Buyer information
    localStorage.removeItem("buyerId");
    localStorage.removeItem("buyerName");
    localStorage.removeItem("buyerLocation");


    // Seller / farmer information
    localStorage.removeItem("producerId");
    localStorage.removeItem("producerName");
    localStorage.removeItem("producerLocation");


    // Current matching information
    localStorage.removeItem("currentDemandId");
    localStorage.removeItem("currentBuyerNeed");


    // Return to homepage
    navigate("/");
  };


  return (
    <nav className="navbar">

      <div className="navbar-container">


        {/* =================================
            LOGO
        ================================= */}

        <Link
          to="/"
          className="logo"
        >
          Market Access
        </Link>



        {/* =================================
            NOT LOGGED IN
        ================================= */}

        {!role && (
          <div className="nav-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/buy">
              Buy Produce
            </Link>

            <Link to="/sell">
              Sell Produce
            </Link>

          </div>
        )}



        {/* =================================
            BUYER NAVIGATION
        ================================= */}

        {role === "buyer" && (
          <div className="nav-links">

            <Link to="/buyer/need">
              Find a Match
            </Link>

            <Link to="/buyer/matches">
              Matches
            </Link>

          </div>
        )}



        {/* =================================
            SELLER NAVIGATION
        ================================= */}

        {role === "seller" && (
          <div className="nav-links">

            <Link to="/seller">
              Add Produce
            </Link>

            <Link to="/seller/matches">
              Buyer Matches
            </Link>

          </div>
        )}



        {/* =================================
            LOGIN / LOGOUT
        ================================= */}

        {!role ? (

          <Link
            to="/login"
            className="login-button"
          >
            Login
          </Link>

        ) : (

          <button
            type="button"
            className="login-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        )}

      </div>

    </nav>
  );
}

export default NavBar;