import { HelloMd } from "../src/Hello/Hello"; 
import { HeroSectionMd } from "../src/HeroSection/HeroSection"

export const componentMetadata = {
  name: "Websites",
  state: "experimental",
  description: "This package contains components...",
  metadata: {
    Hello: HelloMd,
    HeroSection: HeroSectionMd,
  },
};
