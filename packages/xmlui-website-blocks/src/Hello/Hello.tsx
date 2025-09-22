import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./Hello.xmlui?raw";
import codeBehind from "./Hello.xmlui.xs?raw";

const COMP = "Hello";

export const HelloMd = createMetadata({
  status: "experimental",
  description:
    "A sample component",
  props: {},
});

export const helloRenderer = createUserDefinedComponentRenderer(
  HelloMd,
  componentSource,
  codeBehind
);
