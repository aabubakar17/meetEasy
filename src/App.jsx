import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Footer from "./components/Footer";
import SearchResult from "./components/SearchResult";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import CreateEvent from "./components/CreateEvent";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/signup";
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <div className="bg-gray-100">
      {!isLoginPage && !isSignUpPage && (
        <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        <Route path="/signup" element={<SignUp setLoggedIn={setLoggedIn} />} />
        <Route path="/searchresults" element={<SearchResult />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-event" element={<CreateEvent />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
