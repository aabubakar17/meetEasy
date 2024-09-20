import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarIcon, PlusCircle, X } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import FileDropzone from "./FileDropzone";
import { storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import { auth, db } from "../config/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function CreateEventForm() {
  const [eventDate, setEventDate] = useState(null);
  const [eventTime, setEventTime] = useState(""); // Added state for event time
  const [ticketTypes, setTicketTypes] = useState([{ name: "", price: "" }]);
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventDescription, setEventDescription] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [venue, setVenue] = useState("");
  const [errors, setErrors] = useState({
    eventTitle: "",
    eventDescription: "",
    eventLocation: "",
    eventVenue: "",
    eventCategory: "",
    eventDate: "",
    eventTime: "",
    eventTicketType: "",
    file: "",
  });

  const navigate = useNavigate();

  const validateForm = () => {
    let valid = true;
    let eventTitleError = "";
    let eventDescriptionError = "";
    let eventLocationError = "";
    let eventVenueError = "";
    let eventCategoryError = "";
    let eventDateError = "";
    let eventTimeError = "";
    let eventTicketTypeError = "";
    let fileError = "";

    if (!title) {
      eventTitleError = "Event title is required.";
      valid = false;
    }

    if (!eventDescription) {
      eventDescriptionError = "Event description is required.";
      valid = false;
    }

    if (!location) {
      eventLocationError = "Event location is required.";
      valid = false;
    }

    if (!venue) {
      eventVenueError = "Event venue is required.";
      valid = false;
    }

    if (!category) {
      eventCategoryError = "Event category is required.";
      valid = false;
    }

    if (!eventDate) {
      eventDateError = "Event date is required.";
      valid = false;
    }

    if (!eventTime) {
      eventTimeError = "Event time is required.";
      valid = false;
    }

    if (ticketTypes.length === 0) {
      eventTicketTypeError = "At least one ticket type is required.";
      valid = false;
    }

    if (ticketTypes.some((ticket) => !ticket.name || !ticket.price)) {
      eventTicketTypeError = "Ticket name and price are required.";
      valid = false;
    }

    if (!file) {
      fileError = "Event image is required.";
      valid = false;
    }

    setErrors({
      eventTitle: eventTitleError,
      eventDescription: eventDescriptionError,
      eventLocation: eventLocationError,
      eventVenue: eventVenueError,
      eventCategory: eventCategoryError,
      eventDate: eventDateError,
      eventTime: eventTimeError,
      eventTicketType: eventTicketTypeError,
      file: fileError,
    });
    return valid;
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", price: "" }]);
  };

  const removeTicketType = (index) => {
    const newTicketTypes = ticketTypes.filter((_, i) => i !== index);
    setTicketTypes(newTicketTypes);
  };

  const handleTicketTypeChange = (index, field, value) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index][field] = value;
    setTicketTypes(newTicketTypes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Upload image and get the download URL
      const imageUrl = await uploadImage();

      const eventRef = collection(db, "events");
      await addDoc(eventRef, {
        userId: user.uid,
        title: title.toLowerCase(),
        description: eventDescription,
        location: location.toLowerCase(),
        category,
        eventDate,
        eventTime, // Include event time in submission
        ticketTypes,
        venue,
        titleKeywords: title.toLowerCase().split(" "), // Store title keywords
        imageUrl, // Store the image URL in Firestore
      });

      setShowModal(true);
    } catch (error) {
      console.error("Error adding event:", error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/profile");
  };

  const uploadImage = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const imageRef = ref(storage, `images/${file.name + v4()}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("Uploaded a file and got URL:", downloadURL);

      // Store the downloadURL to use when saving the event
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto md:mb-24 my-6">
      <CardHeader>
        <CardTitle>Create a New Event</CardTitle>
        <CardDescription>
          Fill in the details to create your event and start selling tickets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              className={errors.eventTitle ? "border-red-500" : ""}
            />
            {errors.eventTitle && (
              <p className="text-red-500 text-sm">{errors.eventTitle}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your event"
              onChange={(e) => {
                setEventDescription(e.target.value);
              }}
              className={errors.eventDescription ? "border-red-500" : ""}
            />
            {errors.eventDescription && (
              <p className="text-red-500 text-sm">{errors.eventDescription}</p>
            )}
          </div>

          <div className="flex flex-row space-x-4 items-end">
            {" "}
            {/* Flex container for date and time */}
            <div className="space-y-2 flex-1">
              <Label>Event Date</Label>
              <Popover className={errors.eventDate ? "border-red-500" : ""}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      errors.eventDate ? "border-red-500" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? (
                      format(eventDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.eventDate && (
                <p className="text-red-500 text-sm">{errors.eventDate}</p>
              )}
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="time">Event Time</Label>
              <Input
                type="time"
                id="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className={errors.eventTime ? "border-red-500" : ""}
              />
              {errors.eventTime && (
                <p className="text-red-500 text-sm">{errors.eventTime}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Event location"
              onChange={(e) => {
                setLocation(e.target.value);
              }}
              className={errors.eventLocation ? "border-red-500" : ""}
            />
            {errors.eventLocation && (
              <p className="text-red-500 text-sm">{errors.eventLocation}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="Venue">Venue</Label>
            <Input
              id="Venue"
              placeholder="Event Venue"
              onChange={(e) => {
                setVenue(e.target.value);
              }}
              className={errors.eventVenue ? "border-red-500" : ""}
            />
            {errors.eventVenue && (
              <p className="text-red-500 text-sm">{errors.eventVenue}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ticket Types</Label>
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="Ticket name"
                  value={ticket.name}
                  onChange={(e) =>
                    handleTicketTypeChange(index, "name", e.target.value)
                  }
                  className={errors.eventTicketType ? "border-red-500" : ""}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={ticket.price}
                  onChange={(e) =>
                    handleTicketTypeChange(index, "price", e.target.value)
                  }
                  className={errors.eventTicketType ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTicketType(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTicketType}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Ticket Type
            </Button>
            {errors.eventTicketType && (
              <p className="text-red-500 text-sm">{errors.eventTicketType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Event Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                className={errors.eventCategory ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="arts">Arts & Theater</SelectItem>
                <SelectItem value="food">Food & Drink</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {errors.eventCategory && (
              <p className="text-red-500 text-sm">{errors.eventCategory}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Event Image</Label>

            <FileDropzone
              className={
                errors.file
                  ? "border-2 border-dashed border-red-500 rounded-lg flex flex-col gap-1 p-6 items-center "
                  : "border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center "
              }
              setFile={setFile}
            />
            {file && file.name}
            {errors.file && (
              <p className="text-red-500 text-sm">{errors.file}</p>
            )}
          </div>
          {/* <Button
            type="button"
            onClick={uploadImage}
            className="bg-black mt-2"
            size="lg"
          >
            Upload
          </Button> */}
          <Button type="submit" className="w-full bg-black">
            Create Event
          </Button>
        </form>
      </CardContent>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-xl font-semibold">Event Created</h2>
            <p>Your Event has been successfully created.</p>
            <Button onClick={handleCloseModal}>Close</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
