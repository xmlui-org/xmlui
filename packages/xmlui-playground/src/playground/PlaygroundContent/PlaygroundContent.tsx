import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./PlaygroundContent.xmlui";

const COMP = "PlaygroundContent";

export const PlaygroundContentMd = createMetadata({
  status: "internal",
  description: "PlaygroundContent component",
  props: {},
});

export const playgroundContentRenderer = createUserDefinedComponentRenderer(
  PlaygroundContentMd,
  componentSource,
);
