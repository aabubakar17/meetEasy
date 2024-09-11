import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";
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
import { ref, uploadBytes } from "firebase/storage";
import { format } from "date-fns";

export default function EditEvent() {
  const { eventId } = useParams(); // Assuming eventId is passed via route params
  const [eventData, setEventData] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([{ name: "", price: "" }]);
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

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
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleTicketTypeChange = (index, field, value) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index][field] = value;
    setTicketTypes(newTicketTypes);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        title,
        description,
        location,
        category,
        eventDate,
        ticketTypes,
        imageUrlL: file ? file.name : eventData.imageUrlL,
      });

      // Navigate back to profile or show a success message
      navigate("/profile");
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const uploadImage = () => {
    if (!file) return;

    const imageRef = ref(storage, `images/${file.name + v4()}`);
    uploadBytes(imageRef, file).then((snapshot) => {
      console.log("Uploaded a blob or file!", snapshot);
    });
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
            />
          </div>

          <div className="space-y-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event"
            />
          </div>

          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
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
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location"
            />
          </div>

          <div className="space-y-2">
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
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={ticket.name}
                  onChange={(e) =>
                    handleTicketTypeChange(index, "name", e.target.value)
                  }
                  placeholder="Ticket name"
                />
                <Input
                  type="number"
                  value={ticket.price}
                  onChange={(e) =>
                    handleTicketTypeChange(index, "price", e.target.value)
                  }
                  placeholder="Price"
                />
              </div>
            ))}
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
            Update Event
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
