import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";

import BuyerNeed from "./pages/BuyerNeed";
import MatchResults from "./pages/MatchResults";

import SellerDashboard from "./pages/SellerDashboard";
import SellerMatches from "./pages/SellerMatches";

function App() {
  return (
    <BrowserRouter>

      <NavBar />

      <Routes>

        {/* =====================
            PUBLIC
        ===================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =====================
            BUYER
        ===================== */}

        <Route
          path="/buy"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BuyerNeed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buyer/need"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BuyerNeed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buyer/matches"
          element={
            <ProtectedRoute allowedRole="buyer">
              <MatchResults />
            </ProtectedRoute>
          }
        />


        {/* =====================
            SELLER
        ===================== */}

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

        <Route
          path="/seller/matches"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerMatches />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;