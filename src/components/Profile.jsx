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

export default function profile() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white  py-6 px-4 md:px-6">
        <div className="container flex items-center gap-4">
          <Avatar className="h-12 w-12 md:h-16 md:w-16">
            <AvatarImage src="/placeholder-user.jpg" alt="@username" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-semibold md:text-2xl">John Doe</h1>
            <p className="text-sm text-muted-foreground">Event Creator</p>
          </div>
        </div>
      </header>
      <main className="flex-1 py-8 px-4 md:px-6">
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="border-b">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="events">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Charity Gala</CardTitle>
                  <CardDescription>
                    <span>October 15, 2023</span>
                    <br />
                    <span>Tickets sold: 250</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <img
                      src="/vite.svg"
                      width={600}
                      height={400}
                      alt="Event Image"
                      className="aspect-[3/2] object-cover rounded-md"
                    />
                    <p>
                      Join us for our annual charity gala, where we raise funds
                      for local organizations.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">View Event</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Annual Charity Gala</CardTitle>
                  <CardDescription>
                    <span>October 15, 2023</span>
                    <br />
                    <span>Tickets sold: 250</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <img
                      src="/vite.svg"
                      width={600}
                      height={400}
                      alt="Event Image"
                      className="aspect-[3/2] object-cover rounded-md"
                    />
                    <p>
                      Join us for our annual charity gala, where we raise funds
                      for local organizations.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">View Event</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="attendees">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Charity Gala</CardTitle>
                  <CardDescription>
                    <span>October 15, 2023</span>
                    <br />
                    <span>Tickets sold: 250</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <img
                      src="/vite.svg"
                      width={600}
                      height={400}
                      alt="Event Image"
                      className="aspect-[3/2] object-cover rounded-md"
                    />
                    <div className="grid gap-2">
                      <h4 className="font-semibold">Attendee List</h4>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">John Doe</div>
                            <div className="text-sm text-muted-foreground">
                              john@example.com
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>JA</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">Jane Appleseed</div>
                            <div className="text-sm text-muted-foreground">
                              jane@example.com
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>SM</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">Sarah Miller</div>
                            <div className="text-sm text-muted-foreground">
                              sarah@example.com
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">View Attendees</Button>
                </CardFooter>
              </Card>
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
                  <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select id="role" defaultValue="event-creator">
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event-creator">
                        Event Creator
                      </SelectItem>
                      <SelectItem value="event-organizer">
                        Event Organizer
                      </SelectItem>
                      <SelectItem value="event-attendee">
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
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
