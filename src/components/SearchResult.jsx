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
import { fetchEventsByClassification } from "../services/getEvents.service";

const SearchResult = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const locationSearch = searchParams.get("location");
  const eventSearch = searchParams.get("event");
  const categorySearch = decodeURIComponent(searchParams.get("category") || "");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const externalEventsPromises = [];

        // Fetch external events based on eventSearch or categorySearch
        if (eventSearch) {
          externalEventsPromises.push(
            fetchEventsByLocationKeyword(eventSearch, locationSearch)
          );
        }
        if (categorySearch) {
          externalEventsPromises.push(
            fetchEventsByClassification(categorySearch, 3, 16)
          );
        }

        let communityEvents = [];
        if (categorySearch === "Community Events") {
          const communityEventsRef = collection(db, "events");
          const communityEventsSnapshot = await getDocs(communityEventsRef);
          communityEvents = communityEventsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        }

        const externalEvents = await Promise.all(externalEventsPromises);
        const userEvents = [];

        // Handle Firestore event search with multiple keywords
        if (eventSearch) {
          const searchKeywords = eventSearch
            .split(" ")
            .map((word) => word.toLowerCase());
          const eventsRef = collection(db, "events");

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
            userEvents.push(...keywordEvents);
          }
        }

        // Deduplicate external events based on name
        const uniqueExternalEvents = Array.from(
          new Map(
            externalEvents.flat().map((event) => [
              event.name?.toLowerCase(), // Use event name for uniqueness
              event,
            ])
          ).values()
        );

        // No deduplication for community events (if needed, adjust this logic)
        const uniqueUserEvents = Array.from(
          new Map(
            userEvents.map((event) => [
              event.name?.toLowerCase(), // Use event name for uniqueness
              event,
            ])
          ).values()
        );

        // Combine unique external events and community events separately
        const allEvents = [
          ...uniqueExternalEvents,
          ...communityEvents,
          ...uniqueUserEvents,
        ];

        setSearchResults(allEvents);
      } catch (err) {
        setError("Failed to fetch events. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [eventSearch, locationSearch, categorySearch]);

  return (
    <div className="min-h-screen container bg-transparent mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {categorySearch
          ? `${
              categorySearch.includes("Events")
                ? categorySearch
                : `${categorySearch} Events`
            }`
          : `Search Results for ${eventSearch} in ${locationSearch || ""}`}
      </h1>
      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {searchResults.length > 0
          ? searchResults.map((event) => (
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
                  <h2 className="text-orange-50 text-xl font-semibold">
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
          : !loading && (
              <p>No events found for your search. Try another query.</p>
            )}
      </div>
    </div>
  );
};

export default SearchResult;
