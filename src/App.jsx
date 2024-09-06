import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Footer from "./components/Footer";
import SearchResult from "./components/SearchResult";
import SignUp from "./components/SignUp";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/signup";
  return (
    <div className="bg-gray-100">
      {!isLoginPage && !isSignUpPage && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/searchresults" element={<SearchResult />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
