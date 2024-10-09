import React from "react";
import { Button } from "@/components/ui/button";
import { Drama, LandPlot, Users, Film, HeartHandshake } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Categories() {
  const categories = [
    { name: "Community Events", icon: HeartHandshake },
    { name: "Arts & Theatre", icon: Drama },
    { name: "Sports", icon: LandPlot },
    { name: "Family", icon: Users },
    { name: "Film", icon: Film },
    ,
  ];
  const navigate = useNavigate();

  const handleExploreCategory = (category) => {
    if (!category) return;
    const encodedCategory = encodeURIComponent(category);
    navigate(`/searchresults?category=${encodedCategory}`);
  };

  return (
    <section className="w-full py-12 pb-14 bg-neutral-800 text-orange-100">
      <h2 className="orbitron-font text-3xl pb-6 text-center font-bold mb-4">
        Explore Categories
      </h2>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.name}
                className="orbitron-font flex flex-col items-center"
              >
                <div className="relative flex flex-col items-center">
                  <Button
                    aria-label={`Explore ${category.name}`}
                    className="w-20 h-20 rounded-full flex flex-col items-center justify-center p-0 bg-gradient-to-tr from-orange-100 to-stone-300 text-neutral-800 hover:from-neutral-700 hover:to-neutral-600 transition-all duration-300 group"
                    onClick={() => {
                      handleExploreCategory(category.name);
                    }}
                  >
                    <IconComponent className="w-8 h-8 text-neutral-700 group-hover:text-orange-100 transition-colors duration-300" />
                  </Button>
                  <span className="mt-2 text-sm font-medium text-center group-hover:text-orange-100 transition-colors duration-300">
                    {category.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
