import { HeroSectionMd } from "../src/HeroSection/HeroSection"
import { ScrollToTopMd } from "../src/ScrollToTop/ScrollToTop"
import { CarouselMd } from "../src/Carousel/Carousel"
import { HelloMd } from "../src/Hello/Hello"

export const componentMetadata = {
  name: "Websites",
  state: "experimental",
  description: "This package contains components...",
  metadata: {
    HelloMd: HelloMd,
    HeroSection: HeroSectionMd,
    ScrollToTop: ScrollToTopMd,
    Carousel: CarouselMd,
  },
};
