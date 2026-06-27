import { HeroSectionMd } from "../src/HeroSection/HeroSection";
import { ScrollToTopMd } from "../src/ScrollToTop/ScrollToTop";
import { CarouselMd } from "../src/Carousel/Carousel";
import { FancyButtonMd } from "../src/FancyButton/FancyButton";
import { BackdropMd } from "../src/Backdrop/Backdrop";
import { BreakoutMd } from "../src/Breakout/Breakout";

export const componentMetadata = {
  name: "Websites",
  state: "experimental",
  description: "This package contains components...",
  metadata: {
    HeroSection: HeroSectionMd,
    ScrollToTop: ScrollToTopMd,
    Carousel: CarouselMd,
    FancyButton: FancyButtonMd,
    Backdrop: BackdropMd,
    Breakout: BreakoutMd,
  },
};
