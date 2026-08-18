import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link to="/" className="logo">
        market access
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/sell">Sell Produce</Link>
          <Link to="/buy">Buy Produce</Link>
          <Link to="/matches">Matches</Link>
        </div>

      <Link to="/login" className="login-button">
  Login
</Link>

      </div>
    </nav>
  );
}

export default NavBar;