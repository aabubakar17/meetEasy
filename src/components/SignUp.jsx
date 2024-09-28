import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, db } from "../config/firebase";
import {
  setDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"; // Import Firestore functions

const SignUp = ({ setLoggedIn }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const validateForm = () => {
    let valid = true;
    let firstNameError = "";
    let lastNameError = "";
    let emailError = "";
    let passwordError = "";

    if (!firstName) {
      firstNameError = "First name is required.";
      valid = false;
    }

    if (!lastName) {
      lastNameError = "Last name is required.";
      valid = false;
    }

    if (!email) {
      emailError = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      emailError = "Please enter a valid email address.";
      valid = false;
    }

    if (!password) {
      passwordError = "Password is required.";
      valid = false;
    } else if (password.length < 6) {
      passwordError = "Password must be at least 6 characters.";
      valid = false;
    }

    setErrors({
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
      password: passwordError,
    });
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Set persistence and create the user
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Update user's display name
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
        });

        // Save user data to Firestore with their UID as the document ID
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: user.displayName || `${firstName} ${lastName}`,
          email: user.email,
          photoURL: user.photoURL || "",
          role: "user", // Default role
          createdAt: serverTimestamp(), // Firestore timestamp
          lastLoginAt: serverTimestamp(), // Timestamp for login
        });

        // Redirect and log in

        setLoggedIn(true);
        navigate("/profile");
      } catch (error) {
        console.error("Error signing up:", error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Save Google user data to Firestore if it's a new user
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || "",
          email: user.email,
          photoURL: user.photoURL || "",
          role: "Event Attendee", // Default role
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        // Update last login time for existing users
        await setDoc(
          userRef,
          {
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      setLoggedIn(true);
      navigate("/profile");
    } catch (error) {
      console.error("Error logging in with Google:", error.message);
    }
  };

  return (
    <>
      <div className="w-full flex justify-center min-h-screen xl:grid xl:min-h-[600px] xl:grid-cols-2 xl:min-h-[1100px] 2xl:min-h-screen">
        <div className="flex items-center justify-center p-6">
          <div className="mx-auto grid xl:min-h-[600px] xl:-mt-48 max-w-[800px] gap-6">
            <div className="pt-4">
              <Link to="/" className="flex items-start">
                <img
                  src="meetEasy_logo.png"
                  className="h-28 w-auto -ml-12"
                  alt="Flowbite Logo"
                />
              </Link>
            </div>
            <div className="grid gap-4">
              <h1 className="orbitron-font text-4xl font-bold">Sign Up</h1>
              <p className="text-balance text-muted-foreground">
                Enter your information to create an account
              </p>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="orbitron-font" htmlFor="first-name">
                      First name
                    </Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Max"
                      className={`bg-gray-100 ${
                        errors.firstName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label className="orbitron-font" htmlFor="last-name">
                      Last name
                    </Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Robinson"
                      className={`bg-gray-100 ${
                        errors.lastName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="orbitron-font" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    className={`bg-gray-100 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label className="orbitron-font" htmlFor="password">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-gray-100 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="orbitron-font bg-neutral-700 w-full "
                >
                  Create an account
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-1/2 border-t border-gray-400 " />
                  <span className="text-gray-500 text-sm">OR</span>
                  <span className="w-1/2 border-t border-gray-400 " />
                </div>
                <div className="relative flex justify-center text-xs uppercase"></div>
              </div>
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="orbitron-font w-full"
              >
                <FcGoogle size={32} /> &nbsp;Sign up with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden bg-muted xl:block">
          <img
            src="https://images.unsplash.com/photo-1531058020387-3be344556be6?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8OHx8fGVufDB8fHx8fA%3D%3D"
            alt="Image"
            width="1920"
            height="1080"
            className="h-full w-full object-cover "
          />
        </div>
      </div>
    </>
  );
};

export default SignUp;
