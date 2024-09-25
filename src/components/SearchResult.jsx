import React, { useEffect, useState } from "react";
import { fetchEventsByLocationKeyword } from "../services/getEvents.service";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
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

      const eventsRef = collection(db, "events");
      let userEvents = [];

      // Handle multiple word search for Firestore events
      const searchKeywords = eventSearch
        .split(" ")
        .map((word) => word.toLowerCase());

      if (searchKeywords.length > 0) {
        for (const keyword of searchKeywords) {
          const keywordQuery = query(
            eventsRef,
            where("titleKeywords", "array-contains", keyword)
          );
          const keywordSnapshot = await getDocs(keywordQuery);
          const keywordEvents = keywordSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          userEvents = [...userEvents, ...keywordEvents];
        }
      }

      // Deduplicate user events based on event ID and name
      const seenEvents = new Set();
      const uniqueUserEvents = userEvents.filter((event) => {
        const eventKey = `${event.id}-${event.name?.toLowerCase()}`;
        if (seenEvents.has(eventKey)) {
          return false; // Already seen, filter out
        } else {
          seenEvents.add(eventKey); // Mark as seen
          return true; // Keep the event
        }
      });

      // Merge external events and Firestore user events
      const allEvents = [...uniqueUserEvents, ...(externalEvents || [])];

      // Deduplicate merged events
      const mergedSeenEvents = new Set();
      const mergedEvents = allEvents.filter((event) => {
        const eventKey = `${event.id}-${event.name?.toLowerCase()}`;
        if (mergedSeenEvents.has(eventKey)) {
          return false; // Already seen in merged, filter out
        } else {
          mergedSeenEvents.add(eventKey); // Mark as seen
          return true; // Keep the event
        }
      });

      setSearchResults(mergedEvents);
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
            <Card
              key={event.id}
              className="bg-neutral-700 rounded-lg shadow-lg"
            >
              <CardHeader className="flex flex-col items-start">
                <img
                  src={
                    event.imageUrl ||
                    event.images?.[0]?.url ||
                    "default-image.jpg"
                  }
                  alt={event.name || event.title}
                  className="w-full h-48 object-cover mb-4"
                />
                <h2 className=" text-orange-50 text-xl font-semibold">
                  {event.name || event.title}
                </h2>
                <span className="text-orange-50 text-sm">
                  {(() => {
                    let eventDate;
                    if (event.dates?.start?.localDate) {
                      eventDate = new Date(event.dates.start.localDate);
                    } else if (event.eventDate) {
                      eventDate =
                        typeof event.eventDate.seconds === "number"
                          ? new Date(event.eventDate.seconds * 1000)
                          : new Date(event.eventDate);
                    }
                    return eventDate
                      ? eventDate.toDateString()
                      : "Date not available";
                  })()}{" "}
                  {event.dates?.start?.localTime && (
                    <>at {event.dates.start.localTime.substring(0, 5)}</>
                  )}
                  {event.eventTime && <>at {event.eventTime}</>}
                </span>
              </CardHeader>

              <CardFooter className="flex justify-between items-center">
                <span className="text-orange-50">
                  {event._embedded?.venues?.[0]?.name || event.venue}
                </span>

                <Button
                  className="bg-gray-200 text-neutral-700 hover:bg-neutral-400"
                  onClick={() => navigate(`/event-details/${event.id}`)}
                >
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
