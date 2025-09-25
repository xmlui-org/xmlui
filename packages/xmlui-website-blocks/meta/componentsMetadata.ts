import { HeroSectionMd } from "../src/HeroSection/HeroSection"
import { ScrollToTopMd } from "../src/ScrollToTop/ScrollToTop"
import { CarouselMd } from "../src/Carousel/Carousel"
import { HelloMd } from "../src/Hello/Hello"
import { FancyButtonMd } from "../src/FancyButton2/FancyButton"

export const componentMetadata = {
  name: "Websites",
  state: "experimental",
  description: "This package contains components...",
  metadata: {
    Hello: HelloMd,
    HeroSection: HeroSectionMd,
    ScrollToTop: ScrollToTopMd,
    Carousel: CarouselMd,
    FancyButton: FancyButtonMd,
  },
};
