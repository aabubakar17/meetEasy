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

import FileDropzone from "./FileDropzone";
import { storage } from "../config/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { auth, db } from "../config/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function CreateEventForm() {
  const [eventDate, setEventDate] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([{ name: "", price: "" }]);
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventDescription, setEventDescription] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

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
    console.log("test");
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted", {
      eventDate,
      ticketTypes,
      // Add other form fields here
    });

    try {
      // Add event to database
      const user = auth.currentUser;
      console.log(user);
      if (!user) return;

      const eventRef = collection(db, "events");
      await addDoc(eventRef, {
        userId: user.uid,
        title,
        description: eventDescription,
        location,
        category,
        eventDate,
        ticketTypes,
        imageUrl: file.name,
      });
      setShowModal(true);
    } catch (error) {
      console.error("Error adding event:", error.message);
    }

    // Clear form fields

    // Optionally show a success message to the user
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.reload();
  };

  const uploadImage = () => {
    if (!file) return;
    setLoading(true);
    // Here you would typically upload the file to your backend
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    const imageRef = ref(storage, `images/${file.name + v4()}`);
    uploadBytes(imageRef, file).then((snapshot) => {
      console.log("Uploaded a blob or file!", snapshot);
    });
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your event"
              onChange={(e) => {
                setEventDescription(e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Event Date and Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Event location"
              onChange={(e) => {
                setLocation(e.target.value);
              }}
            />
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
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={ticket.price}
                  onChange={(e) =>
                    handleTicketTypeChange(index, "price", e.target.value)
                  }
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Event Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Event Image</Label>

            <FileDropzone
              className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center "
              setFile={setFile}
            />
            {file && file.name}
          </div>
          <Button
            type="button"
            onClick={uploadImage}
            className="bg-black mt-2"
            size="lg"
          >
            Upload
          </Button>
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
