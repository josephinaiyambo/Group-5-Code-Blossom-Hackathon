import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import BuyerMarketPlace from "./pages/BuyerMarketPlace";
import SellerDashboard from "./pages/SellerDashboard";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>

        {/* Public pages */}
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Buyer pages */}
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BuyerMarketPlace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buy"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BuyerMarketPlace />
            </ProtectedRoute>
          }
        />

        {/* Seller pages */}
        <Route
          path="/sell"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;