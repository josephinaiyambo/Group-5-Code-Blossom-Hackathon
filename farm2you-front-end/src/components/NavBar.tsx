import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

function NavBar() {
  // Makes navbar update when the user navigates after login
  useLocation();

  const navigate = useNavigate();

  const role = localStorage.getItem("userRole");

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="logo">
          Market Access
        </Link>


        {/* NOT LOGGED IN */}
        {!role && (
          <div className="nav-links">
            <Link to="/">Home</Link>

            <Link to="/buy">
              Buy Produce
            </Link>

            <Link to="/sell">
              Sell Produce
            </Link>
          </div>
        )}


        {/* BUYER NAVIGATION */}
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


        {/* SELLER NAVIGATION */}
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


        {/* LOGIN / LOGOUT */}
        {!role ? (
          <Link
            to="/login"
            className="login-button"
          >
            Login
          </Link>
        ) : (
          <button
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