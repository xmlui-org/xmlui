import { createComponentRenderer, createMetadata } from "xmlui";
import { Hello } from "./HelloNative";

const COMP = "Hello";

export const HelloMd = createMetadata({
  status: "experimental",
  description: "Hello",
  props: {
  },
  events: {
  },
  apis: {
  },
});

export const helloComponentRenderer = createComponentRenderer(
  COMP,
  HelloMd,
  ({  }) => {
    return <Hello />;
  },
);
