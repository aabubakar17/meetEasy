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
import ClipLoader from "react-spinners/ClipLoader";
import { add } from "date-fns";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function EventRegistration({
  event,
  onClose,
  isRegistered,
  setIsRegistered,
}) {
  const { eventId } = useParams();
  const [ticketQuantities, setTicketQuantities] = useState(
    event.ticketTypes?.map(() => 0) || []
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState(false);
  const [isAddedToGoogleCalendar, setIsAddedToGoogleCalendar] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
  });

  const isFree = event.ticketTypes?.every((type) => type.price === "0");
  const calculateTotal = () => {
    return ticketQuantities
      .reduce((total, quantity, index) => {
        const price = parseFloat(event.ticketTypes[index].price);
        return total + price * quantity;
      }, 0)
      .toFixed(2);
  };

  const handleTicketQuantityChange = (index, increment) => {
    setTicketQuantities((prevQuantities) =>
      prevQuantities.map((quantity, i) =>
        i === index ? Math.max(0, quantity + increment) : quantity
      )
    );
  };

  const validateForm = () => {
    let valid = true;
    let fullNameError = "";
    let emailError = "";

    if (!name) {
      fullNameError = "Full Name is required.";
      valid = false;
    }

    if (!email) {
      emailError = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      emailError = "Please enter a valid email address.";
      valid = false;
    }

    setErrors({
      fullName: fullNameError,
      email: emailError,
    });
    return valid;
  };

  useEffect(() => {
    const total = calculateTotal();

    if (!isFree && total > 0) {
      const fetchClientSecret = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            "https://meeteasy-xl05.onrender.com/create-payment-intent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                amount: Math.round(total * 100), // Convert to cents
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const responseText = await response.text();
          const { clientSecret } = JSON.parse(responseText);

          if (!clientSecret || !clientSecret.startsWith("pi_")) {
            throw new Error("Invalid client secret received from server");
          }

          setClientSecret(clientSecret);
        } catch (error) {
          console.error("Error fetching client secret:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchClientSecret();
    }
  }, [isFree, ticketQuantities]);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!validateForm()) return;
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

      // Add attendee information
      await addDoc(attendeesRef, {
        name,
        email,
        eventId,
        eventTitle: event.title,
        eventDate: event.eventDate,
        imageUrl: event.imageUrl,
        tickets: ticketQuantities,
      });

      // Add the event to Google Calendar
      sendRegistrationEmail(email, event);
      await updateDoc(eventRef, {
        ticketsSold: increment(ticketQuantities.reduce((a, b) => a + b, 0)), // Increment by the number of tickets
      });

      setIsRegistered(true);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleAddEventToGoogleCalendar = async () => {
    // Prepare event details for Google Calendar
    const eventDetails = {
      summary: event.title,
      location: event.location || "",
      description: event.description || "",
      start: {
        dateTime: (() => {
          const eventDate = new Date(event.eventDate.seconds * 1000);
          const [hours, minutes] = event.eventTime.split(":");
          eventDate.setHours(hours, minutes);
          return eventDate.toISOString();
        })(),
        timeZone: "Europe/London",
      },
      end: {
        dateTime: (() => {
          const eventDate = new Date(event.eventDate.seconds * 1000);
          const [hours, minutes] = event.eventTime
            ? event.eventTime.split(":")
            : [0, 0];
          eventDate.setHours(hours, minutes);
          eventDate.setHours(eventDate.getHours() + 1);
          return eventDate.toISOString();
        })(),
        timeZone: "Europe/London",
      },
    };

    try {
      setLoading(true); // Show loader while the process is ongoing
      await addEventToGoogleCalendar(eventDetails); // Await the calendar addition process
      setIsAddedToGoogleCalendar(true); // Only set this when the event is successfully added
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error);
    } finally {
      setLoading(false); // Hide loader once the process is done
    }
  };

  const makePayment = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
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
    if (!cardElement) {
      return;
    }

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
            aria-label="Close Modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Event has been added to your calendar</CardTitle>
              <CardTitle className="my-2"></CardTitle>
              <CardDescription>
                Thank you for registering for {event.name || event.title} on{" "}
                {new Date(event.eventDate.seconds * 1000).toLocaleDateString()}!
                <br />
                Check your profile to see event details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                We've added the event to your Google Calendar. You can view the
                event details in your Google Calendar.
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
            aria-label="Close Modal"
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
                <FcGoogle size={32} /> &nbsp; Add Event to Google Calendar
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
          aria-label="Close Modal"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="flex justify-center items-center">
            <ClipLoader
              color="#000"
              loading={loading}
              size={150}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        ) : (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>
                {" "}
                {(event.name || event.title).replace(
                  /\w\S*/g,
                  (text) =>
                    text.charAt(0).toUpperCase() +
                    text.substring(1).toLowerCase()
                )}
              </CardTitle>
              <CardDescription>
                Register for this exciting event!
                {event.eventDate && (
                  <div className="flex items-center mt-2 space-x-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>
                      {new Date(
                        event.eventDate.seconds * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {event.eventTime && (
                  <div className="flex items-center mt-2 space-x-2">
                    <ClockIcon className="w-5 h-5" />
                    <span>{event.eventTime}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center mt-2 space-x-2">
                    <MapPinIcon className="w-5 h-5" />
                    <span>
                      {event.location.replace(
                        /\w\S*/g,
                        (text) =>
                          text.charAt(0).toUpperCase() +
                          text.substring(1).toLowerCase()
                      )}
                    </span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={isFree ? handleSubmit : makePayment}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    onChange={(e) => setName(e.target.value)}
                    id="name"
                    className={errors.fullName ? "border-red-500" : ""}
                    value={name}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm">{errors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    onChange={(e) => setEmail(e.target.value)}
                    id="email"
                    type="email"
                    className={errors.email ? "border-red-500" : ""}
                    value={email}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {!isFree && (
                  <div>
                    {event.ticketTypes?.map((ticketType, index) => (
                      <div
                        key={ticketType.name}
                        className="flex items-center justify-between mb-4"
                      >
                        <span>
                          {ticketType.name} - £{ticketType.price}
                        </span>
                        <div className="flex items-center">
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              handleTicketQuantityChange(index, -1);
                            }}
                            disabled={ticketQuantities[index] === 0}
                            className="bg-neutral-700 text-orange-50 hover:bg-orange-50 hover:text-neutral-700 hover:border hover:border-neutral-700"
                          >
                            -
                          </Button>
                          <span className="mx-2">
                            {ticketQuantities[index]}
                          </span>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              handleTicketQuantityChange(index, 1);
                            }}
                            className="bg-neutral-700 text-orange-50 hover:bg-orange-50 hover:text-neutral-700 hover:border hover:border-neutral-700"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="mb-4 text-lg font-semibold">
                      Total: £{calculateTotal()}
                    </div>
                  </div>
                )}

                {!isFree && (
                  <div className="space-y-2">
                    <Label htmlFor="card">Card Details</Label>
                    <CardElement id="card" options={{ hidePostalCode: true }} />
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-neutral-700 text-orange-50 hover:bg-orange-50 hover:text-neutral-700 hover:border hover:border-neutral-700"
                >
                  {isFree ? "Register" : "Purchase Tickets"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch"></CardFooter>
          </Card>
        )}

        {alert && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-4">
            You've already registered for this event.
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
