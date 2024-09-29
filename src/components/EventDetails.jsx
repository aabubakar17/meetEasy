import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchEventDetailsById } from "../services/getEvents.service";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventRegistration from "./EventRegistration";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { auth, db } from "../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ClipLoader } from "react-spinners";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      const data = await fetchEventDetailsById(eventId);
      setEvent(data);
    };

    const user = auth.currentUser;
    console.log("User:", user);

    const checkRegistration = async () => {
      if (user) {
        try {
          const attendeesRef = collection(db, "attendees");
          const q = query(
            attendeesRef,
            where("eventId", "==", eventId),
            where("email", "==", user?.email)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            console.log("Already registered for this event");
            setIsRegistered(true);
            return;
          }
        } catch (error) {
          console.error("Error checking registration status:", error);
        }
      }
    };

    fetchEventDetails();
    checkRegistration();
  }, [eventId]);

  if (!event) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <ClipLoader
          color="#000"
          loading="true"
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  return (
    <div className="bg-transparent ">
      <div className=" mx-auto backdrop-blur-2xl p-6 ">
        <div className="flex flex-col items-center ">
          <div className="lg:flex  mb-4">
            <img
              src={
                event.imageUrl || event.images?.[0]?.url || "default-image.jpg"
              }
              alt={`${event.name || event.title} event image`}
              className="w-full h-96 object-cover rounded-lg "
            />
          </div>
          <div className="flex flex-col items-center lg:w-2/3 lg:pl-6 mt-6 lg:mt-0">
            <h1 className="orbitron-font text-3xl font-bold">
              {event.name ||
                event.title.replace(
                  /\w\S*/g,
                  (text) =>
                    text.charAt(0).toUpperCase() +
                    text.substring(1).toLowerCase()
                )}
            </h1>
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
              <p className="text-gray-600 mt-1">
                {event.location.replace(
                  /\w\S*/g,
                  (text) =>
                    text.charAt(0).toUpperCase() +
                    text.substring(1).toLowerCase()
                )}
              </p>
            )}
            {event.venue && <p className="text-gray-600 mt-1">{event.venue}</p>}
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

            {event.ticketTypes?.length > 0 && (
              <div className="mt-2">
                {event.ticketTypes.map((ticket, index) => (
                  <Badge
                    key={index}
                    className="mb-2 mr-2 text-sm text-gray-700 bg-green-100 hover:bg-green-200"
                  >
                    {ticket.name}:{" "}
                    {ticket.price === "0" ? "Free" : `£${ticket.price}`}
                  </Badge>
                ))}
              </div>
            )}

            {!event.url && (
              <div className="mt-4">
                <Button
                  onClick={() => setShowModal(true)} // Fix typo in onClick
                  className="bg-neutral-700 text-orange-100 hover:bg-orange-100 hover:text-neutral-700 hover:border hover:border-neutral-700"
                  disabled={isRegistered}
                >
                  Get Tickets
                </Button>
              </div>
            )}

            {event.description && (
              <div className="mt-4">
                <h2 className="orbitron-font text-xl font-semibold">
                  Description
                </h2>
                <p className=" description text-gray-700 mt-2">
                  {event.description}
                </p>
              </div>
            )}
            {event.url && (
              <div className="mt-4">
                <Link to={event.url} target="_blank" className="text-blue-500">
                  <Button
                    as="a"
                    href={event.url}
                    target="_blank"
                    className="bg-neutral-700 text-orange-100 hover:bg-orange-100 hover:text-neutral-700 hover:border hover:border-neutral-700"
                  >
                    Buy Ticket
                  </Button>
                </Link>
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

          {showModal && (
            <Elements stripe={stripePromise}>
              <EventRegistration
                event={event}
                onClose={() => setShowModal(false)}
                setIsRegistered={setIsRegistered}
                isRegistered={isRegistered}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
