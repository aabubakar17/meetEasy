import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider, db } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const Login = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const validateForm = () => {
    let valid = true;
    let emailError = "";
    let passwordError = "";

    // Email validation
    if (!email) {
      emailError = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      emailError = "Please enter a valid email address.";
      valid = false;
    }

    // Password validation
    if (!password) {
      passwordError = "Password is required.";
      valid = false;
    }

    setErrors({ email: emailError, password: passwordError });
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Sign in the user with email and password
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Get the signed-in user
        const user = userCredential.user;
        console.log("User logged in:", user);

        // Update lastLoginAt in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            lastLoginAt: serverTimestamp(),
          });
        }

        setLoggedIn(true);
        navigate("/profile");
      } catch (error) {
        console.error("Error logging in:", error.message);
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
          role: "user", // Default role
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

      console.log("User logged in with Google:", user);
      setLoggedIn(true);
      navigate("/profile");
    } catch (error) {
      console.error("Error logging in with Google:", error.message);
    }
  };

  console.log(auth?.currentUser?.email);

  return (
    <>
      <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[1100px]">
        <div className="flex items-center justify-center py-12 ">
          <div className="mx-auto grid xl:min-h-[600px] xl:-mt-48 max-w-[800px] gap-6">
            <div className="pt-4">
              <Link to="/" className="flex items-center">
                <img
                  src="https://flowbite.com/docs/images/logo.svg"
                  className="h-12"
                  alt="Flowbite Logo"
                />
                <span className="self-center text-3xl font-semibold whitespace-nowrap dark:text-white">
                  MeetEasy
                </span>
              </Link>
            </div>
            <div className="grid  ">
              <h1 className="text-4xl font-bold">Login</h1>
              <p className="text-balance text-muted-foreground">
                Enter your email below to login to your account
              </p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-black">
                Login
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-100 px-2 pt-1 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
            </form>
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full"
            >
              Login with Google &nbsp; <FcGoogle size={32} />
            </Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden bg-muted lg:block">
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

export default Login;
