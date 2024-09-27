import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth, storage } from "../config/firebase"; // Include storage
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import FileDropzone from "./FileDropzone";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Added getDownloadURL
import { format } from "date-fns";
import { v4 } from "uuid"; // Import UUID to create unique filenames
import { CalendarIcon, PlusCircle, X } from "lucide-react";

// Helper function to generate keywords array from title
const generateKeywords = (title) => {
  return title
    .split(" ")
    .map((word) => word.toLowerCase()) // Convert each word to lowercase
    .filter((word) => word.length > 1); // Filter out any short/insignificant words
};

export default function EditEvent() {
  const { eventId } = useParams(); // Assuming eventId is passed via route params
  const [eventData, setEventData] = useState(null);
  const [eventTime, setEventTime] = useState(""); // Added state for event time
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([{ name: "", price: "" }]);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(""); // To store the current image URL
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
  const [showModal, setShowModal] = useState(false);

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

    if (!description) {
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

  // Fetch existing event data
  useEffect(() => {
    const fetchEvent = async () => {
      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        const data = eventSnap.data();
        setEventData(data);
        setTitle(data.title);
        setDescription(data.description);
        setLocation(data.location);
        setCategory(data.category);
        setEventDate(
          data.eventDate ? new Date(data.eventDate.seconds * 1000) : null
        );
        setTicketTypes(data.ticketTypes || [{ name: "", price: "" }]);
        setImageUrl(data.imageUrl); // Set current image URL
        setVenue(data.venue);
        setEventTime(data.eventTime); // Set event time
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleTicketTypeChange = (index, field, value) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index][field] = value;
    setTicketTypes(newTicketTypes);
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", price: "" }]);
  };

  const removeTicketType = (index) => {
    const newTicketTypes = ticketTypes.filter((_, i) => i !== index);
    setTicketTypes(newTicketTypes);
  };

  // Handle image upload and get the download URL
  const uploadImage = async () => {
    if (!file) return null;

    try {
      const imageRef = ref(storage, `images/${file.name + v4()}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/profile");
  };

  // Handle updating the event
  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // If a new image was uploaded, get its URL
      let newImageUrl = imageUrl;
      if (file) {
        newImageUrl = await uploadImage();
      }

      console.log(eventDate);

      // Generate titleKeywords based on the event title
      const titleKeywords = generateKeywords(title);

      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        title,
        description,
        location: location.toLowerCase(), // Store location in lowercase
        category,
        eventDate,
        eventTime,
        ticketTypes,
        imageUrl: newImageUrl, // Update image URL (if it changed)
        titleKeywords, // Save the generated title keywords
      });

      // Navigate back to profile or show a success message
      setShowModal(true);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  if (!eventData) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-6">
      <CardHeader>
        <CardTitle>Edit Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateEvent} className="space-y-6">
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              className={errors.eventTitle && "border-red-500"}
              aria-label="Event Title"
            />
            {errors.eventTitle && (
              <p className="text-red-500 text-sm">{errors.eventTitle}</p>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event"
              className={errors.eventDescription && "border-red-500"}
              aria-label="Event Description"
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
              <Popover>
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
                className={errors.eventTime && "border-red-500"}
              />
              {errors.eventTime && (
                <p className="text-red-500 text-sm">{errors.eventTime}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="Venue">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location"
              className={errors.eventLocation && "border-red-500"}
              aria-label="Event Location"
            />
            {errors.eventLocation && (
              <p className="text-red-500 text-sm">{errors.eventLocation}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="Venue">Venue</Label>
            <Input
              value={venue}
              placeholder="Event Venue"
              onChange={(e) => {
                setVenue(e.target.value);
              }}
              className={errors.eventVenue && "border-red-500"}
              aria-label="Event Venue"
            />
            {errors.eventVenue && (
              <p className="text-red-500 text-sm">{errors.eventVenue}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                className={errors.eventCategory && "border-red-500"}
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
            <Label>Ticket Types</Label>
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={ticket.name}
                  onChange={(e) =>
                    handleTicketTypeChange(index, "name", e.target.value)
                  }
                  placeholder="Ticket name"
                  className={errors.eventTicketType && "border-red-500"}
                  aria-label="Ticket Name"
                />
                <Input
                  type="number"
                  value={ticket.price}
                  onChange={(e) =>
                    handleTicketTypeChange(index, "price", e.target.value)
                  }
                  placeholder="Price"
                  className={errors.eventTicketType && "border-red-500"}
                  aria-label="Ticket Price"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTicketType(index)}
                  aria-label="Remove Ticket Type"
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

          <Button
            type="submit"
            className="w-full bg-neutral-700 text-orange-50 hover:bg-orange-50 hover:text-neutral-700 hover:border hover:border-neutral-700"
          >
            Update Event
          </Button>
        </form>
      </CardContent>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-xl font-semibold">Event Updated</h2>
            <p>Your Event has been successfully updated.</p>
            <Button
              className="bg-neutral-700 text-orange-50 hover:bg-orange-50 hover:text-neutral-700 hover:border hover:border-neutral-700"
              onClick={handleCloseModal}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
