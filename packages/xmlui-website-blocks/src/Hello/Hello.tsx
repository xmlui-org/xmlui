import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./Hello.xmlui";
import codeBehind from "./Hello.xmlui.xs";

const COMP = "Hello";

export const HelloMd = createMetadata({
  status: "internal",
  description:
    "A sample component",
  props: {},
});

export const helloRenderer = createUserDefinedComponentRenderer(
  HelloMd,
  componentSource,
  codeBehind
);
