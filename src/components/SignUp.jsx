import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

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

    // First Name validation
    if (!firstName) {
      firstNameError = "First name is required.";
      valid = false;
    }

    // Last Name validation
    if (!lastName) {
      lastNameError = "Last name is required.";
      valid = false;
    }

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
        // Create the user with email and password
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Get the newly created user
        const user = userCredential.user;

        // Optionally, you can save additional user data in Firestore or update the user's profile
        console.log("User signed up:", user);
        setLoggedIn(true);
        navigate("/profile");
      } catch (error) {
        console.error("Error signing up:", error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Sign in the user with Google
      const userCredential = await signInWithPopup(auth, googleProvider);

      // Get the signed-in user
      const user = userCredential?.user;
      console.log("User logged in with Google:", user);
      setLoggedIn(true);
      navigate("/profile");

      // Navigate to profile or dashboard after successful login
    } catch (error) {
      console.error("Error logging in with Google:", error.message);
    }
  };

  return (
    <>
      <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[1100px]">
        <div className="flex items-center justify-center p-12 ">
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
            <div className="grid gap-4">
              <h1 className="text-4xl font-bold">Sign Up</h1>
              <p className="text-balance text-muted-foreground">
                Enter your information to create an account
              </p>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Max"
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Robinson"
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm">{errors.lastName}</p>
                    )}
                  </div>
                </div>
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
                  <Label htmlFor="password">Password</Label>
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
                  Create an account
                </Button>
              </form>
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
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full"
              >
                Login with Google &nbsp; <FcGoogle size={32} />
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

export default SignUp;
