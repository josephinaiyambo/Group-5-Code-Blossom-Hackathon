import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Temporary hackathon login
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);

    if (role === "buyer") {
      navigate("/buyer/need");
    } else {
      navigate("/seller");
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-heading">
          <p>WELCOME TO FARM2YOU</p>
          <h1>Login</h1>

          <span>
            Connect with Namibia's local agricultural marketplace.
          </span>
        </div>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>I am a</label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller / Farmer</option>
            </select>
          </div>

          <button className="login-submit" type="submit">
            Login
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;