import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, MapPinIcon, XIcon } from "lucide-react"; // Import the close icon
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  getDocs,
  increment,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useParams } from "react-router-dom";
import { sendRegistrationEmail, addEventToGoogleCalendar } from "../lib/utils";
import { FcGoogle } from "react-icons/fc";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function EventRegistration({
  event,
  onClose,
  isRegistered,
  setIsRegistered,
}) {
  const { eventId } = useParams();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState(false);
  const [isAddedToGoogleCalendar, setIsAddedToGoogleCalendar] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  const isFree = event.ticketTypes?.[0]?.price === "0";
  const ticketPrice = !isFree ? parseFloat(event.ticketTypes?.[0]?.price) : 0;

  useEffect(() => {
    if (!isFree && ticketQuantity > 0) {
      const fetchClientSecret = async () => {
        try {
          const response = await fetch(
            "http://localhost:5000/create-payment-intent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                amount: Math.round(ticketPrice * ticketQuantity * 100), // Convert to cents
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const responseText = await response.text();
          console.log("Raw response:", responseText); // Log raw response for debugging

          try {
            const { clientSecret } = JSON.parse(responseText);
            if (!clientSecret || !clientSecret.startsWith("pi_")) {
              throw new Error("Invalid client secret received from server");
            }
            setClientSecret(clientSecret);
          } catch (jsonError) {
            throw new Error(
              "Error parsing JSON response: " + jsonError.message
            );
          }
        } catch (error) {
          console.error("Error fetching client secret:", error);
        }
      };
      fetchClientSecret();
    }
  }, [ticketQuantity, ticketPrice, isFree]);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    try {
      // Check if the email is already registered for this event
      const attendeesRef = collection(db, "attendees");
      const q = query(
        attendeesRef,
        where("eventId", "==", eventId),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Already registered for this event");
        setAlert(true);
        return;
      }

      // Update ticketsSold field in the events collection
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        ticketsSold: increment(ticketQuantity), // Increment by the number of tickets
      });

      // Add attendee information
      await addDoc(attendeesRef, {
        name,
        email,
        eventId,
        eventTitle: event.title,
        eventDate: event.eventDate,
        imageUrl: event.imageUrl,
        tickets: ticketQuantity,
      });

      // Add the event to Google Calendar
      sendRegistrationEmail(email, event);

      setIsRegistered(true);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleAddEventToGoogleCalendar = () => {
    // Prepare event details for Google Calendar
    const eventDetails = {
      summary: event.title,
      location: event.location || "",
      description: event.description || "",
      start: {
        // Combine the event date and time
        dateTime: (() => {
          const eventDate = new Date(event.eventDate.seconds * 1000); // Get the date
          const [hours, minutes] = event.eventTime.split(":"); // Extract hours and minutes
          eventDate.setHours(hours, minutes); // Set the event time
          return eventDate.toISOString();
        })(),
        timeZone: "Europe/London", // Valid IANA time zone
      },
      end: {
        // Set the end time to 1 hour after the start time
        dateTime: (() => {
          const eventDate = new Date(event.eventDate.seconds * 1000); // Get the date
          const [hours, minutes] = event.eventTime.split(":"); // Extract hours and minutes
          eventDate.setHours(hours, minutes); // Set the event time
          eventDate.setHours(eventDate.getHours() + 1); // Add 1 hour to create the end time
          return eventDate.toISOString();
        })(),
        timeZone: "Europe/London", // Valid IANA time zone
      },
    };
    addEventToGoogleCalendar(eventDetails);
    setIsAddedToGoogleCalendar(true);
  };

  const makePayment = async (event) => {
    event.preventDefault();
    const attendeesRef = collection(db, "attendees");
    const q = query(
      attendeesRef,
      where("eventId", "==", eventId),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log("Already registered for this event");
      setAlert(true);
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!alert) {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name,
              email,
            },
          },
        }
      );
      if (error) {
        console.error("Payment error:", error.message);
      } else if (paymentIntent.status === "succeeded") {
        console.log("Payment succeeded!");
        // Proceed with registration after successful payment
        handleSubmit();
        setIsRegistered(true);
      }
    }
  };

  if (isAddedToGoogleCalendar) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative bg-white p-8 rounded-lg">
          <button
            className="absolute top-1 right-1 p-2 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <XIcon className="w-5 h-5" />
          </button>
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Event has been added to your calendar</CardTitle>
              <CardDescription>
                Thank you for registering for {event.name || event.title} on{" "}
                {new Date(event.eventDate.seconds * 1000).toLocaleDateString()}!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                We've added the event to your Google Calendar. You can view the
                event details in your calendar.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative bg-white p-8 rounded-lg">
          <button
            className="absolute top-1 right-1 p-2 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <XIcon className="w-5 h-5" />
          </button>
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Registration Confirmed</CardTitle>
              <CardDescription>
                Thank you for registering for {event.name || event.title}!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                We've sent a confirmation email with event details to your
                registered email address.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleAddEventToGoogleCalendar}
                className="w-full"
                variant="outline"
              >
                Add Event to Google Calendar &nbsp; <FcGoogle size={32} />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white p-8 rounded-lg">
        <button
          className="absolute top-1 right-1 p-2 rounded-full hover:bg-gray-200"
          onClick={onClose}
        >
          <XIcon className="w-5 h-5" />
        </button>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{event.name || event.title}</CardTitle>
            <CardDescription>Register for this exciting event!</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={isFree ? handleSubmit : makePayment}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {event.eventDate
                      ? typeof event.eventDate.seconds === "number"
                        ? new Date(
                            event.eventDate.seconds * 1000
                          ).toLocaleDateString()
                        : new Date(event.eventDate).toLocaleDateString()
                      : "TBD"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {event.dates?.start?.localTime
                      ? ` ${event.dates.start.localTime.substring(0, 5)}`
                      : event.eventTime
                      ? ` ${event.eventTime}`
                      : ""}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{event.location || "Location not provided"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input onChange={(e) => setName(e.target.value)} id="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  type="email"
                />
              </div>

              {!isFree && (
                <div className="space-y-2">
                  <Label htmlFor="tickets">Number of Tickets</Label>
                  <Select
                    value={ticketQuantity.toString()}
                    onValueChange={(value) =>
                      setTicketQuantity(parseInt(value))
                    }
                  >
                    <SelectTrigger id="tickets">
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!isFree && (
                <div className="mb-4 text-lg font-semibold">
                  Total: £{(ticketPrice * ticketQuantity).toFixed(2)}
                </div>
              )}
              {!isFree && (
                <div className="space-y-2">
                  <Label htmlFor="card">Card Details</Label>
                  <CardElement id="card" options={{ hidePostalCode: true }} />
                </div>
              )}
              <Button type="submit" className="w-full">
                {isFree ? "Register" : "Purchase Tickets"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch"></CardFooter>
        </Card>
        {alert && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-2 text-center rounded-lg">
            You are already registered for this event
          </div>
        )}
      </div>
    </div>
  );
}

const StripeWrapper = ({ event, onClose }) => (
  <Elements stripe={stripePromise}>
    <EventRegistration event={event} onClose={onClose} />
  </Elements>
);

export { StripeWrapper };