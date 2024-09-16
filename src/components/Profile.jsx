import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FaEdit } from "react-icons/fa";
import { X } from "lucide-react";
import { deleteDoc, query, where } from "firebase/firestore";
export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("Event Creator");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [groupedAttendees, setGroupedAttendees] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Fetch user profile from Firestore
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            setEditName(userDoc.data().displayName || "");
            setEditEmail(userDoc.data().email || "");
            setEditRole(userDoc.data().role || "Event Creator");
          }

          // Fetch only the events created by the current user
          const eventsRef = collection(db, "events");
          const eventsSnapshot = await getDocs(eventsRef);
          const eventsList = eventsSnapshot.docs
            .filter((doc) => doc.data().userId === user.uid)
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

          setEvents(eventsList);

          // Fetch attendees for the events created by the current user
          const attendeesRef = collection(db, "attendees");
          const attendeesSnapshot = await getDocs(attendeesRef);
          const attendeesList = attendeesSnapshot.docs
            .map((doc) => doc.data())
            .filter((attendee) =>
              eventsList.some((event) => event.id === attendee.eventId)
            );

          // Group attendees by eventId
          const attendeesByEvent = {};
          attendeesList.forEach((attendee) => {
            if (attendee.eventId) {
              const eventId = attendee.eventId;
              if (!attendeesByEvent[eventId]) {
                const event = eventsList.find((event) => event.id === eventId);
                attendeesByEvent[eventId] = {
                  eventTitle: event ? event.title : "Unknown Event",
                  imageUrl: event ? event.imageUrl : "/placeholder-image.jpg",
                  attendees: [],
                };
              }
              attendeesByEvent[eventId].attendees.push(attendee);
            }
          });

          setGroupedAttendees(attendeesByEvent);
        } else {
          navigate("/login");
        }
      } catch (error) {
        if (error.code !== "permission-denied") {
          console.error("Error fetching user data:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSaveChanges = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          displayName: editName,
          email: editEmail,
          role: editRole,
          lastLoginAt: serverTimestamp(),
        });
        setShowModal(true);
        console.log("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.reload();
  };

  const handleDeleteEventModal = (eventId) => {
    setSelectedEventId(eventId); // Store the event ID of the event you want to delete
    setShowDeleteModal(true); // Show the modal
  };

  const handleDeleteEvent = async () => {
    try {
      if (selectedEventId) {
        const eventRef = doc(db, "events", selectedEventId);
        await deleteDoc(eventRef); // Delete the event from Firestore
        setEvents(events.filter((event) => event.id !== selectedEventId)); // Update local state to remove the event
        setShowDeleteModal(false); // Close the modal
        console.log("Event deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white py-6 px-4 md:px-6">
        <div className="container flex items-center gap-4">
          <Avatar className="h-12 w-12 md:h-16 md:w-16">
            <AvatarImage
              src={userData?.photoURL || "/placeholder-user.jpg"}
              alt="@username"
            />
            <AvatarFallback>
              {userData?.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-semibold md:text-2xl">
              {userData?.displayName || "John Doe"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {userData?.role || "Event Creator"}
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 py-8 px-4 md:px-6">
        <Tabs defaultValue="events" className="w-full">
          <div className="flex flex-col items-center md:flex-row justify-normal mb-4">
            {/* Tabs List */}
            <TabsList className="border-b">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Button aligned to the right */}
            <Link to="/create-event">
              <Button className="ml-4 mt-2 imd:m-0 bg-black py-2">
                Create Events +{" "}
              </Button>
            </Link>
          </div>
          <TabsContent value="events">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {events.map((event, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {event.title.replace(
                          /\w\S*/g,
                          (text) =>
                            text.charAt(0).toUpperCase() +
                            text.substring(1).toLowerCase()
                        )}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/edit-event/${event.id}`)}
                          type="button"
                          variant="outline"
                          size="icon"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          onClick={() => handleDeleteEventModal(event.id)}
                          type="button"
                          variant="outline"
                          size="icon"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CardDescription className="flex flex-row items-center justify-between">
                      <span>Tickets sold: {event.ticketsSold}</span>
                      <Button
                        onClick={() => navigate(`/event-details/${event.id}`)}
                        variant="outline"
                        className="mt-2"
                      >
                        View Event
                      </Button>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <img
                        src={event.imageUrl || "/placeholder-image.jpg"}
                        width={600}
                        height={400}
                        alt="Event Image"
                        className="aspect-[3/2] object-cover rounded-md"
                      />
                      <div className="description">{event.description}</div>
                    </div>
                  </CardContent>
                  <CardFooter></CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="attendees">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(groupedAttendees).map(([eventId, eventData]) => (
                <Card key={eventId}>
                  <CardHeader>
                    <CardTitle>
                      {eventData.eventTitle.replace(
                        /\w\S*/g,
                        (text) =>
                          text.charAt(0).toUpperCase() +
                          text.substring(1).toLowerCase()
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {/* Show the event image */}
                      <img
                        src={eventData.imageUrl || "/placeholder-image.jpg"}
                        alt="Event Image"
                        className="aspect-[3/2] object-cover rounded-md"
                      />
                      <div className="grid gap-2">
                        <h4 className="font-semibold">Attendee List</h4>
                        <div className="grid gap-2">
                          {/* Show attendee information */}
                          {eventData.attendees.map((attendee, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <Avatar>
                                <AvatarImage
                                  src={
                                    attendee.photoURL || "/placeholder-user.jpg"
                                  }
                                />
                                <AvatarFallback>
                                  {attendee.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {attendee.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {attendee.email}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline">View Attendees</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your profile information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    id="role"
                    value={editRole}
                    onValueChange={(value) => setEditRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Event Creator">
                        Event Creator
                      </SelectItem>
                      <SelectItem value="Event Organiser">
                        Event Organizer
                      </SelectItem>
                      <SelectItem value="Event Attendee">
                        Event Attendee
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-8 rounded-lg">
                  <h2 className="text-xl font-semibold">Profile Updated</h2>
                  <p>Your profile has been updated successfully.</p>
                  <Button onClick={handleCloseModal}>Close</Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-xl font-semibold">Delete Event</h2>
            <p>Are you sure you want to delete your event?</p>
            <div className="flex gap-4 mt-4">
              <Button onClick={handleDeleteEvent}>Delete event</Button>
              <Button onClick={() => setShowDeleteModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
