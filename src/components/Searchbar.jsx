import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Searchbar = () => {
  const [event, setEvent] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(event, location);
    if (!event || !location) return;
    navigate(`/searchresults?event=${event}&location=${location}`);
  };

  return (
    <form className="max-w-4xl mx-auto">
      <div className="flex w-full">
        {/* Search Input */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
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
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            className="block p-2.5 pl-10 w-full z-20 text-base text-gray-900 bg-gray-50 rounded-l-full border-s-gray-200 border-s-2 border border-gray-300 outline-none"
            placeholder="Search events"
            onChange={(e) => setEvent(e.target.value)}
            required
          />
        </div>

        {/* Location Input */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
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
                d="M10 2a6 6 0 0 1 6 6c0 3.5-6 10-6 10s-6-6.5-6-10a6 6 0 0 1 6-6Z"
              />
              <circle cx="10" cy="8" r="2" fill="currentColor" />
            </svg>
          </div>
          <input
            type="search"
            className="block p-2.5 pl-10 w-full z-20 text-base text-gray-900 bg-gray-50 rounded-r-full border-s-gray-50  border-s-2 border border-gray-300 dark:bg-gray-700 dark:border-s-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 outline-none"
            placeholder="Location"
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <button
            type="submit"
            className="absolute top-0 right-0 px-4 text-sm font-medium h-full text-white bg-blue-700 rounded-full border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={handleSubmit}
          >
            <svg
              className="w-4 h-4"
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
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
            <span className="sr-only">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default Searchbar;
