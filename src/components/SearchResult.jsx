import React, { useEffect, useState } from "react";
import { fetchEventsByLocationKeyword } from "../services/getEvents.service";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SearchResult = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const locationSearch = searchParams.get("location");
  const eventSearch = searchParams.get("event");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetchEventsByLocationKeyword(
        eventSearch,
        locationSearch
      );
      setSearchResults(response || []); // Accessing the events within _embedded
    };

    fetchEvents();
  }, [eventSearch, locationSearch]);

  return (
    <div className="container bg-transparent mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{eventSearch}" in "{locationSearch}"
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {searchResults.length > 0 ? (
          searchResults.map((event) => (
            <Card key={event.id} className="shadow-md">
              <CardHeader className="flex flex-col items-start">
                <img
                  src={event.images[0]?.url || "default-image.jpg"} // Default image if none exists
                  alt={event.name}
                  className="w-full h-48 object-cover mb-4"
                />
                <h2 className="text-xl font-semibold">{event.name}</h2>
                <span className="text-gray-500 text-sm">
                  {new Date(event.dates.start.localDate).toDateString()}{" "}
                  {event.dates.start.localTime && (
                    <>at {event.dates.start.localTime.substring(0, 5)}</>
                  )}
                </span>
              </CardHeader>

              <CardFooter className="flex justify-between items-center">
                <span>{event._embedded.venues[0].name}</span>
                <Button as="a" href={event.url} target="_blank">
                  Buy Tickets
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p>No events found for your search. Try another query.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResult;
