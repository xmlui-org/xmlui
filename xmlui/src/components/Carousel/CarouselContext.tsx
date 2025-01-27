import { createContext, useContext } from "react";

export const CarouselContext = createContext(null);
export const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel");
  }
  return context;
};

export const useIsSlideActive = (index) => {
  const { activeSlide } = useCarousel();
  return activeSlide === index;
};
