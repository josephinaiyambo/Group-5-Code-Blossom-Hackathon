import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import NavBar from "./components/NavBar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import BuyerMarketPlace from "./pages/BuyerMarketPlace";
import SellerDashboard from "./pages/SellerDashboard";

function App() {
  return (
    <BrowserRouter>

      <NavBar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/buyer"
          element={<BuyerMarketPlace />}
        />

        <Route
          path="/seller"
          element={<SellerDashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;