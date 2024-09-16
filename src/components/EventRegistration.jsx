import { useState } from "react";
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

export default function EventRegistration({ event, onClose }) {
  const [isRegistered, setIsRegistered] = useState(false);
  const { eventId } = useParams();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState(false);

  const isFree = event.ticketTypes?.[0]?.price === "0";
  const ticketPrice = !isFree ? parseFloat(event.ticketTypes?.[0]?.price) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      // Add the event to Google Calendar
      await addEventToGoogleCalendar(eventDetails);
      sendRegistrationEmail(email, event);

      setIsRegistered(true);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  if (isRegistered) {
    return (
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
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white p-8 rounded-lg">
        {/* Close Icon Button */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
