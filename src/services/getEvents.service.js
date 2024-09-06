const TICKETMASTER_API_KEY = import.meta.env
  .VITE_REACT_APP_TICKETMASTER_API_KEY;
import axios from "axios";

// Function to fetch events by classification
const fetchEventsByClassification = async (classification) => {
  try {
    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&size=1&classificationName=${classification}&city=london`
    );
    return response.data._embedded?.events || [];
  } catch (error) {
    console.error(`Error fetching ${classification} events:`, error);
    return [];
  }
};

// Main function to fetch events from multiple classifications
export const getEvents = async () => {
  try {
    const classifications = [
      "Arts & Theatre",
      "sports",
      "comedy",
      "family",
      "music",
      "film",
    ]; // Add more classifications as needed
    const eventPromises = classifications.map((classification) =>
      fetchEventsByClassification(classification)
    );

    // Resolve all promises and merge events from different classifications
    const results = await Promise.all(eventPromises);
    const allEvents = results.flat(); // Merge arrays of events
    return allEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

export const fetchEventsByLocationKeyword = async (event, location) => {
  try {
    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&size=6&keyword=${event}&city=${location}`
    );
    return response.data._embedded?.events || [];
  } catch (error) {
    console.error(`Error fetching ${event} events:`, error);
    return [];
  }
};
