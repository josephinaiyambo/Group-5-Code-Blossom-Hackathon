import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";
import AddNeed from "./pages/AddNeed";
import Matches from "./pages/Matches";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sell" element={<AddProduct />} />
        <Route path="/buy" element={<AddNeed />} />
        <Route path="/matches" element={<Matches />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;