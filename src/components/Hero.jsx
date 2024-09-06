import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const imageUrls = [
  "https://www.behr.com/colorfullybehr/wp-content/uploads/2016/12/iStock-450422439-scaled.jpg",
  "https://lumiere-a.akamaihd.net/v1/images/tlk_characters_card_r_62bd14e2.jpeg",
  "https://www.ispo.com/sites/default/files/2023-08/Bildschirmfoto%202023-08-04%20um%2015.55.11.png",
  "https://i0.wp.com/hyperallergic-newspack.s3.amazonaws.com/uploads/2021/07/Van-Gogh-Immersive-Ayelet.jpeg?fit=2400%2C724&quality=95&ssl=1",
];

const Hero = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <div className="relative w-full top-0">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {imageUrls.map((url, index) => (
            <CarouselItem key={index} className="relative">
              <img
                src={url}
                alt={`Carousel item ${index + 1}`}
                className="w-full h-96 object-cover"
              />
              <div className="absolute bottom-4 left-4  p-10 rounded-lg">
                <span className="text-white text-2xl font-bold">
                  {`Where community meets`} <br /> {` your favourite events`}{" "}
                  {/* Add descriptive text */}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-4 transform -translate-y-1/2 text-black" />
        <CarouselNext className="absolute top-1/2 right-4 transform -translate-y-1/2 text-black" />
      </Carousel>
    </div>
  );
};

export default Hero;
