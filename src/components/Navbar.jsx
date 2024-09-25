import React, { useState } from "react";
import Searchbar from "./Searchbar";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const Navbar = ({ loggedIn, setLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowSearch(!showSearch);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");

      setLoggedIn(false);

      // Optionally, redirect to login or home page after logout
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <nav className="top-0 w-full z-50 no-overflow-x">
      <div className="flex flex-wrap items-center -end-2 justify-between p-4 md:justify-center py-5 ">
        <Link to="/" className="flex -ml-10 items-start ">
          <img
            src="meetEasy_logo.png"
            alt="logo"
            className="w-auto md:-ml-4 h-16 md:h-24 rounded-full"
          />
        </Link>

        {/* SEARCH BAR COMPONENT */}
        <div className="w-full md:-ml-24 md:w-2/3 order-3 md:order-1 mt-4 md:mt-0">
          <Searchbar />
        </div>

        <div className="flex md:order-2">
          <button
            type="button"
            onClick={handleToggle}
            aria-controls="navbar-search"
            aria-expanded={isOpen}
            className="md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 rounded-lg text-sm p-2.5"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h18M1 9h18M1 17h18"
              />
            </svg>
            <span className="sr-only">Open main menu</span>
          </button>
        </div>

        <div
          className={`${
            isOpen ? "block" : "hidden"
          } items-center bg-transparent justify-between w-full md:flex md:w-auto md:order-1`}
          id="navbar-search"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border  rounded-lg  md:flex-row md:space-x-8 md:mt-0 md:border-0 dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-800 ml-auto">
            <li>
              {loggedIn ? (
                <Link
                  to="/profile"
                  className="orbitron-font block py-2 px-3 text-neutral-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-neutral-800 md:p-0 dark:text-white md:dark:hover:text-neutral-500 dark:hover:bg-gray-800 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-800"
                >
                  Profile
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="orbitron-font block py-2 px-3 text-neutral-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-neutral-900 md:p-0 dark:text-white md:dark:hover:text-neutral-500 dark:hover:bg-gray-800 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-800"
                >
                  Sign Up/Login
                </Link>
              )}
            </li>
            <li>
              {loggedIn && (
                <Link
                  to="/login"
                  onClick={handleLogout}
                  className="orbitron-font block py-2 px-3 text-neutral-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-neutral-800 md:p-0 dark:text-white md:dark:hover:text-neutral-500 dark:hover:bg-gray-800 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-800"
                >
                  Logout
                </Link>
              )}
            </li>
            <li>
              <a
                href="#"
                className="orbitron-font block py-2 px-3 text-neutral-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-neutral-900 md:p-0 dark:text-white md:dark:hover:text-neutral-500 dark:hover:bg-gray-800 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-800"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
