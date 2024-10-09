import {
  Calendar,
  Ticket,
  Users,
  Bell,
  PlusCircle,
  Search,
} from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="flex items-center justify-center w-full py-16 text-white">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-3xl text-neutral-800 font-bold mb-4 orbitron-font">
          Discover and Create Events Effortlessly
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Whether you're attending or hosting, our platform makes it easy to
          find and organize events with just a few clicks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          <FeatureCard
            icon={<PlusCircle size={24} />}
            title="Custom Event Creation"
            description="Planning an event? Customize every detail, from tickets to timings, with our user-friendly event creation tools."
          />
          <FeatureCard
            icon={<Search size={24} />}
            title="Search Events"
            description="Powered by Ticketmaster, you can search for major events alongside community-hosted gatherings, ensuring you never miss out."
          />
          <FeatureCard
            icon={<Ticket size={24} />}
            title="Seamless Ticketing"
            description="Secure your spot at any event in seconds. Our integrated ticketing system ensures fast, hassle-free booking."
          />
          <FeatureCard
            icon={<Calendar size={24} />}
            title="Calendar Integration"
            description="Stay organized by syncing your registered events directly with Google Calendar. Never miss an event."
          />
          <FeatureCard
            icon={<Users size={24} />}
            title="Community Focused"
            description="Connect with like-minded individuals and discover unique local experiences. Build communities and make memories."
          />
          <FeatureCard
            icon={<Bell size={24} />}
            title="Event Notifications"
            description="Stay informed with personalized email notifications. Get all essential details directly to your inbox."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="bg-neutral-800 text-orange-100 p-4 rounded-lg">
        {icon}
      </div>
      <h3 className="text-lg text-neutral-800 font-semibold orbitron-font">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
