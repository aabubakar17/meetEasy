const TICKETMASTER_API_KEY = import.meta.env
  .VITE_REACT_APP_TICKETMASTER_API_KEY;
import axios from "axios";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

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

const fetchTicketmasterEventDetails = async (eventId) => {
  try {
    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${TICKETMASTER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Handle 404 errors specifically
      console.warn(`Event ID ${eventId} not found in Ticketmaster.`);
      return null;
    }
    console.error("Error fetching Ticketmaster event details:", error);
    throw error; // Re-throw other errors to handle in the main function
  }
};

// Function to fetch event details from Firestore
const fetchFirestoreEventDetails = async (eventId) => {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      return eventSnap.data();
    } else {
      console.error("No such document in Firestore!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching Firestore event details:", error);
    throw error; // Rethrow to handle in the main function
  }
};

export const fetchEventDetailsById = async (eventId) => {
  try {
    // Check Firebase first
    const eventRef = doc(db, "events", eventId);
    const eventDoc = await getDoc(eventRef);

    // If the event is found in Firebase, return it
    if (eventDoc.exists()) {
      return { ...eventDoc.data(), id: eventDoc.id };
    }

    // If not found in Firebase, check Ticketmaster API
    const ticketmasterEvent = await fetchTicketmasterEventDetails(eventId);
    return ticketmasterEvent;
  } catch (error) {
    console.error("Error fetching event details:", error);
    throw error;
  }
};
