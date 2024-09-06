import React from "react";
import Hero from "./Hero";
import FeaturedEvents from "./FeaturedEvents";
import CallToAction from "./CallToAction";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 no-overflow-x">
      <div className="justify-center">
        <Hero />
      </div>
      <div className="justify-center">
        <FeaturedEvents />
      </div>
      <div className="justify-center">
        {/* <CallToAction /> */}
        <CallToAction />
      </div>
    </div>
  );
};

export default LandingPage;
