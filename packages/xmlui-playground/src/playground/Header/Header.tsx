import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./Header.xmlui";

const COMP = "PlaygroundHeader";

export const PlaygroundHeaderMd = createMetadata({
  status: "internal",
  description: "Header component",
  props: {},
});

export const playgroundHeaderRenderer = createUserDefinedComponentRenderer(
  PlaygroundHeaderMd,
  componentSource,
);
