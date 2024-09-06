import React from "react";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="bg-transparent dark:bg-gray-900">
      <div className="gap-8 items-center py-8 px-4 mx-auto max-w-screen-2xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6">
        <img
          className="w-full dark:hidden"
          src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup.svg"
          alt="dashboard image"
        />
        <img
          className="w-full hidden dark:block"
          src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg"
          alt="dashboard image"
        />
        <div className="mt-4 md:mt-0">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Join the Community of Event Enthusiasts!
          </h2>
          <h3 className="font-extrabold my-2 ">Create Events</h3>
          <p>
            Got an exciting event idea? Our platform lets you bring your event
            vision to life. Create and manage your events easily, and share them
            with a wide audience.
          </p>
          <h3 className="font-extrabold my-2">Discover Events</h3>
          <p>
            Discover and sign up for events that match your interests. From
            concerts and festivals to workshops and meetups, find events you
            love and join the excitement.
          </p>
          <p className="mb-6 font-light text-gray-500 md:text-lg dark:text-gray-400"></p>
          <Button className="bg-blue-700 text-white hover:bg-blue-500">
            Get started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
