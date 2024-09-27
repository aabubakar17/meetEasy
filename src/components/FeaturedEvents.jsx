import React, { useEffect, useState } from "react";
import { getEvents } from "../services/getEvents.service";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";

export default function FeaturedEvents() {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true); // Start loading
      const data = await getEvents();
      setEvents(data);
      setLoading(false); // Stop loading after data is fetched
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [events]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + events.length) % events.length
    );
  };

  if (events.length === 0) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <ClipLoader
          color="#000"
          loading={loading}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  return (
    <div className="w-11/12 mx-auto text-center m-8 md:p-12 ">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="flex flex-col md:flex-row items-center w-full"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex flex-col items-start justify-between mb-6 w-full">
            <motion.h2
              className="orbitron-font text-4xl md:text-6xl mb-4 text-left w-full text-ellipsis overflow-hidden "
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
              }}
            >
              {events[currentIndex].name}
            </motion.h2>
            <motion.div
              className="flex flex-col items-start text-left"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, delay: 0.2 },
                },
                exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
              }}
            >
              <p className="text-xl mb-2 ">
                {new Date(
                  events[currentIndex].dates.start.localDate
                ).toDateString()}
                {events[currentIndex].dates.start.localTime && (
                  <>
                    {" "}
                    at{" "}
                    {events[currentIndex].dates.start.localTime.substring(0, 5)}
                  </>
                )}
              </p>
              <p className="text-lg mb-4">
                {events[currentIndex]._embedded.venues[0].name}
              </p>

              <Link
                to={events[currentIndex].url}
                target="_blank"
                className="text-blue-500"
                rel="noopener noreferrer"
              >
                <Button
                  as="a"
                  href={events[currentIndex].url}
                  target="_blank"
                  className="bg-neutral-700 text-orange-50 hover:bg-orange-50 hover:text-neutral-700 hover:border hover:border-neutral-700 text-lg font-semibold text-white"
                >
                  Get Ticket
                </Button>
              </Link>
            </motion.div>
          </div>
          <motion.div
            className="w-full h-auto md:h-96 relative rounded-lg overflow-hidden"
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.5, delay: 0.4 },
              },
              exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
            }}
          >
            <img
              src={events[currentIndex].images[0].url}
              alt={events[currentIndex].name}
              className="w-full h-auto  object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="relative -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {events.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? "bg-black" : "bg-black bg-opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
