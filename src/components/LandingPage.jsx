import React from "react";
import Hero from "./Hero";
import FeaturedEvents from "./FeaturedEvents";
import CallToAction from "./CallToAction";
import FeaturesSection from "./FeaturesSection";
import HowItWorks from "./HowItWorks";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screenno-overflow-x">
      <div className="justify-center">{/* <Hero /> */}</div>
      <div className="justify-center">
        <FeaturedEvents />
      </div>
      <div className="items-center justify-center">
        <FeaturesSection />
        {/*  <CallToAction /> */}
      </div>

      <div className="items-center justify-center">
        <HowItWorks />
      </div>
    </div>
  );
};

export default LandingPage;
