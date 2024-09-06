import React, { useEffect, useState } from "react";
import { getEvents } from "../services/getEvents.service";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const FeaturedEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents().then((data) => {
      setEvents(data);
    });
  }, []);

  return (
    <div className="px-52 pt-6">
      <h2 className="text-3xl font-semibold border-b mb-6">Featured Events</h2>
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:mr-32 text-center md:text-left">
          <h3 className="text-2xl font-semibold mb-2">Fresh Finds</h3>
          <p>
            Check out these top picks from some of our best events in London.
          </p>
        </div>
        <div className="mt-12 md:mt-0 w-full md:w-3/4">
          <Carousel
            opts={{
              align: "start", // Ensures the cards align at the start
            }}
            className="w-full"
          >
            <CarouselContent>
              {events.map((event) => (
                <CarouselItem
                  key={event.id}
                  className="md:basis-1/2 lg:basis-1/3" // Adjusts the number of visible cards on screen
                >
                  <Card className="overflow-hidden shadow-lg">
                    <img
                      src={event.images[0].url}
                      alt={event.name}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">{event.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.dates.start.localDate).toDateString()}{" "}
                        {event.dates.start.localTime && (
                          <>at {event.dates.start.localTime.substring(0, 5)}</>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {event._embedded.venues[0].name}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default FeaturedEvents;
