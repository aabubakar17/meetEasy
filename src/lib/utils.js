import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import emailjs from "emailjs-com";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;

const provider = new GoogleAuthProvider();
const auth = getAuth();
provider.addScope("https://www.googleapis.com/auth/calendar");
export const signInWithGoogle = async () => {
  try {
    const auth = getAuth();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken; // Use this token
    return token;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
  }
};

export const addEventToGoogleCalendar = async (eventDetails) => {
  console.log("Adding event to Google Calendar: ", eventDetails);
  try {
    // Get the token by signing in with Google
    const token = await signInWithGoogle();

    // Check if the token exists
    if (!token) {
      console.error("No token found, user might not be authenticated.");
      return;
    }

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventDetails),
      }
    );

    if (!response.ok) {
      throw new Error("Error adding event to Google Calendar");
    }

    const eventData = await response.json();
    console.log("Event added to Google Calendar: ", eventData);
  } catch (error) {
    console.error("Error adding event to Google Calendar: ", error);
  }
};

export const sendRegistrationEmail = (userEmail, event) => {
  console.log(SERVICE_ID, TEMPLATE_ID, USER_ID);
  const templateParams = {
    to_email: userEmail,
    from_name: "meetEasy",
    subject: `Registration Confirmation for ${event.title}`,
    event_title: event.title.replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    ),
    event_date: new Date(event.eventDate.seconds * 1000).toLocaleDateString(),
    event_time: event.eventTime || "TBD",
    event_location:
      event.location.replace(
        /\w\S*/g,
        (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
      ) || "TBD",
    event_description: event.description || "No description provided.",
  };

  emailjs
    .send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)
    .then((response) => {
      console.log("Email sent successfully:", response);
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
};
