# MeetEasy

[Features](#features) | [Stripe Payment](#stripe-payment) | [Google Calendar Integration](#google-calendar-integration) | [Test User Accounts](#test-user-accounts) | [Email Notifications (EmailJS)](#email-notifications-emailjs) | [Prerequisites for Local Development](#prerequisites-for-local-development) | [Firebase Configuration](#Example-Firebase-Configuration-firebasejs) | [Running the Application Locally](#running-the-application-locally) | [Stripe Setup](#stripe-setup) | [Environment Variables](#environment-variables) | [Important Notes](#important-notes) | [Issues](#issues)

meetEasy is a web application that allows users to discover, create, and register for community-created events as well as Ticketmaster events. It is built with React (Vite) & Tailwind for the front end and Firebase for the back end (Firestore, Firebase Storage, and Authentication).

## Hosted Version

You can find the hosted version of the application [here](https://meeteasy-244a4.web.app/)

## Features

- **Event Listings**: Users can browse both community and Ticketmaster events.
- **Event Creation**: Users can create and manage their own events, including uploading event images to Firebase Storage.
- **Google Calendar Integration**: Registered users can add events they sign up for to their Google Calendar (the app is currently undergoing Google verification).
- **Stripe Payments**: Ticket purchases are processed via Stripe. The payment system is currently in test mode.
- **Email Notifications**: Upon registering for an event, users receive a confirmation email using EmailJS.

## Stripe Payment

The payment feature is integrated with **Stripe** and is currently in **test mode**. Use the following test card for payment purposes:

- **Test Card Number**: 4242 4242 4242 4242
- **Expiration Date**: Any future date
- **CVC**: Any 3-digit number

#### Note: The server for generating the Stripe client secret is hosted on **Render**, which might cause a slight delay during the payment process.

## Google Calendar Integration

This app includes integration with Google Calendar, allowing users to add events to their calendars once they register for them. However, this feature is undergoing **Google verification**.

### Test User Accounts

To test the Google Calendar functionality, you can use the following test user accounts to log in with Google:

**Sarah Robin** (default role: Event Attendee)

- **Email**: sarah.robin120503@gmail.com
- **Password**: s120503!

**Harry Peters** (default role: Event Creator)

- **Email**: harry.peters140696@gmail.com
- **Password**: h140696!

**Note**: You can change the roles for both accounts in the settings tab located in the profile section of the application.

**NOTE**:  
If you encounter Google’s **“Verify it’s you”** prompt, it’s due to logging in from an unfamiliar device/location. The test accounts are each other’s recovery email, so you can verify the login by accessing the other account and entering the security code.

## Email Notifications (EmailJS)

When users register for an event, they receive a confirmation email containing the event details, sent using **EmailJS**.

## Prerequisites for Local Development

1. **Node** and **npm**:

   - **Node.js**: Version **17.9.1** or higher (developed with **Node.js 17.9.1**)

   - **npm**: Version **8.11.0** or higher (comes bundled with Node.js)

2. **Vite** for running the React app.
3. **Firebase Project Setup**:
   - Set up a Firebase project with **Firestore**, **Firebase Storage**, and **Firebase Authentication** enabled.
   - Create the following Firestore collections:
     - `events`: For storing event details.
     - `attendees`: To keep track of users registered for events.
     - `users`: To store user profile information.
   - Firebase Storage for hosting uploaded event images.
4. **Firebase Configuration**:
   - The `firebase.js` file is not included in this repository. You need to create your own configuration file with your Firebase project's credentials.
   - Enable the following Firebase services:
     - **Firestore**
     - **Storage**
     - **Authentication** (Google Sign-In enabled)

### Example Firebase Configuration (Firebase.js)

```javascript
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
```

## Running the Application Locally

1. Clone the repository:

```
 git clone https://github.com/aabubakar17/MeetEasy.git
 cd meetEasy
```

2. Install dependencies: `npm install`
3. Add your Firebase configuration in firebase.js.
4. Start the development server: `npm run dev`
5. cd into meetEasyService and install dependencies:

```
cd meet-Easy-service/api
npm install
```

6. Run local server for generating stripe client secret: `npm start`

## Stripe Setup

If you're using the Stripe payment feature, ensure you have the following:

- A Stripe account.
- A Stripe secret key and public key stored in your environment variables for local development

## Environment Variables

Make sure to set the following environment variables in your .env file:

```
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
VITE_REACT_APP_STRIPE_API_KEY=your-stripe-api-key
VITE_REACT_APP_TICKETMASTER_API_KEY=your-ticketmaster-api-key
VITE_EMAILJS_SERVICE_ID=your-emailjs-service-api-key
VITE_EMAILJS_TEMPLATE_ID=your-emailjs-template-api-key
VITE_EMAILJS_USER_ID=your-emailjs-user-api-key
```

## Important Notes

**Rate Limiting**: The Ticketmaster API enforces rate limiting. I have implemented a rate limiter to avoid excessive requests, but some requests may still fail due to restrictions.

## Issues

If you encounter any issues, feel free to contact me at abubakarabdihakim01@gmail.com.
