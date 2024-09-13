import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchEventDetailsById } from "../services/getEvents.service";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventRegistration from "./EventRegistration";

const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      const data = await fetchEventDetailsById(eventId);
      setEvent(data);
    };

    fetchEventDetails();
  }, [eventId]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/3">
            <img
              src={
                event.imageUrl || event.images?.[0]?.url || "default-image.jpg"
              }
              alt={event.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div className="lg:w-2/3 lg:pl-6 mt-6 lg:mt-0">
            <h1 className="text-3xl font-bold">{event.name || event.title}</h1>
            {event.dates?.start?.localDate && (
              <p className="text-gray-700 mt-2">
                {format(new Date(event.dates.start.localDate), "PPP")}
                {event.dates.start.localTime && (
                  <> at {event.dates.start.localTime.substring(0, 5)}</>
                )}
              </p>
            )}
            {event.place?.name && (
              <p className="text-gray-600 mt-1">{event.place.name}</p>
            )}
            {event.location && (
              <p className="text-gray-600 mt-1">{event.location}</p>
            )}
            {
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
            }
            {event.description && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="text-gray-700 mt-2">{event.description}</p>
              </div>
            )}
            {event.url && (
              <div className="mt-4">
                <Link to={event.url} target="_blank" className="text-blue-500">
                  <Button
                    as="a"
                    href={event.url}
                    target="_blank"
                    className="bg-black text-white"
                  >
                    Buy Ticket
                  </Button>
                </Link>
              </div>
            )}

            {event.ticketTypes?.length > 0 &&
              (event.ticketTypes[0].price === "0" ? (
                <Badge className="text-gray-700 bg-green-100">Free Event</Badge>
              ) : (
                <Badge className="text-gray-700 bg-green-100">
                  £{event.ticketTypes[0].price}
                </Badge>
              ))}

            {!event.url && (
              <div className="mt-4">
                <Button
                  onClick={() => setShowModal(true)} // Fix typo in onClick
                  className="bg-black text-white"
                >
                  Get Tickets
                </Button>
              </div>
            )}

            {event.additionalInfo && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold">
                  Additional Information
                </h2>
                <p className="text-gray-700 mt-2">{event.additionalInfo}</p>
              </div>
            )}
            {event.info && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold">Info</h2>
                <p className="text-gray-700 mt-2">{event.info}</p>
              </div>
            )}
          </div>

          {showModal && <EventRegistration event={event} />}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
