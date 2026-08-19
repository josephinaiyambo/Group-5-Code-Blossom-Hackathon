import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";


/* =========================
   PUBLIC PAGES
========================= */

import Home from "./pages/Home";
import Login from "./pages/Login";


/* =========================
   BUYER PAGES
========================= */

import BuyerSetup from "./pages/BuyerSetup";
import BuyerNeed from "./pages/BuyerNeed";
import MatchResults from "./pages/MatchResults";


/* =========================
   SELLER PAGES
========================= */

import SellerSetup from "./pages/SellerSetup";
import SellerDashboard from "./pages/SellerDashboard";
import SellerMatches from "./pages/SellerMatches";


function App() {
  return (
    <BrowserRouter>

      <NavBar />


      <Routes>

        {/* =================================
            PUBLIC
        ================================= */}

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/login"
          element={<Login />}
        />



        {/* =================================
            BUYER SETUP
        ================================= */}

        <Route
          path="/buyer/setup"
          element={
            <ProtectedRoute allowedRole="buyer">
              <BuyerSetup />
            </ProtectedRoute>
          }
        />



        {/* =================================
            BUYER — CREATE A NEED
        ================================= */}

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



        {/* =================================
            BUYER — MATCH RESULTS
        ================================= */}

        <Route
          path="/buyer/matches"
          element={
            <ProtectedRoute allowedRole="buyer">
              <MatchResults />
            </ProtectedRoute>
          }
        />



        {/* =================================
            SELLER SETUP
        ================================= */}

        <Route
          path="/seller/setup"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerSetup />
            </ProtectedRoute>
          }
        />



        {/* =================================
            SELLER — ADD PRODUCE
        ================================= */}

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



        {/* =================================
            SELLER — BUYER MATCHES
        ================================= */}

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