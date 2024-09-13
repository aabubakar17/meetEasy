import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Footer from "./components/Footer";
import SearchResult from "./components/SearchResult";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import CreateEvent from "./components/CreateEvent";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import EditEvent from "./components/EditEvent";
import DeleteEvent from "./components/DeleteEvent";
import EventDetails from "./components/EventDetails";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/signup";
  const [loggedIn, setLoggedIn] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        console.log("User is logged in");
      } else {
        setLoggedIn(false);
      }
      setLoading(false); // Update loading state
    });

    return () => unsubscribe();
  }, [setLoggedIn]);

  if (loading) {
    // Optionally show a loading spinner or message
    return <div>Loading...</div>;
  }

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
        <Route path="/edit-event/:eventId" element={<EditEvent />} />
        <Route path="/delete-event/:eventId" element={<DeleteEvent />} />
        <Route path="/event-details/:eventId" element={<EventDetails />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
