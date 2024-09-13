import React, { useEffect, useState } from "react";
import { fetchEventsByLocationKeyword } from "../services/getEvents.service";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore"; // Import Firestore functions
import { db } from "../config/firebase"; // Firestore config
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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      // Fetch external events
      const externalEvents = await fetchEventsByLocationKeyword(
        eventSearch,
        locationSearch
      );

      // Fetch user-created events from Firestore
      const eventsRef = collection(db, "events");
      const q = query(
        eventsRef,
        where("location", "==", locationSearch.toLowerCase()),
        where("titleKeywords", "array-contains", eventSearch.toLowerCase())
      );
      const userEventsSnapshot = await getDocs(q);
      const userEvents = userEventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(userEvents);
      // Merge external events and user-created events
      const mergedEvents = [...userEvents, ...(externalEvents || [])];

      setSearchResults(mergedEvents);
      console.log(mergedEvents);
    };

    fetchEvents();
  }, [eventSearch, locationSearch]);

  return (
    <div className="min-h-screen container bg-transparent mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{eventSearch}" in "{locationSearch}"
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {searchResults.length > 0 ? (
          searchResults.map((event) => (
            <Card key={event.id} className="shadow-md">
              <CardHeader className="flex flex-col items-start">
                {console.log(event.eventTime)}
                <img
                  src={
                    event.imageUrl ||
                    event.images?.[0]?.url ||
                    "default-image.jpg"
                  } // Use image from Firebase Storage or external API
                  alt={event.name || event.title}
                  className="w-full h-48 object-cover mb-4"
                />
                <h2 className="text-xl font-semibold">
                  {event.name || event.title}
                </h2>
                <span className="text-gray-500 text-sm">
                  {(() => {
                    let eventDate;

                    // Handle external API date (e.g., event.dates.start.localDate)
                    if (event.dates?.start?.localDate) {
                      eventDate = new Date(event.dates.start.localDate);
                    }
                    // Handle Firestore date (e.g., event.eventDate as Firestore Timestamp)
                    else if (event.eventDate) {
                      eventDate =
                        typeof event.eventDate.seconds === "number"
                          ? new Date(event.eventDate.seconds * 1000) // Firestore Timestamp
                          : new Date(event.eventDate); // Plain Date
                    }

                    // If we have a valid eventDate, format it, otherwise display nothing
                    return eventDate
                      ? eventDate.toDateString()
                      : "Date not available";
                  })()}{" "}
                  {event.dates?.start?.localTime && (
                    <>
                      at{" "}
                      {event.dates.start.localTime.substring(0, 5) ||
                        event.eventTime}
                    </>
                  )}
                  {event.eventTime && <>at {event.eventTime}</>}
                </span>
              </CardHeader>

              <CardFooter className="flex justify-between items-center">
                <span>{event._embedded?.venues?.[0]?.name || event.venue}</span>

                <Button onClick={() => navigate(`/event-details/${event.id}`)}>
                  View Event
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
