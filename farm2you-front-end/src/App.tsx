import NavBar from "./components/navBar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <NavBar />

        <Routes>
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;