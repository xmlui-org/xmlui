import React from "react";
import { createComponentRenderer } from "../components-core/renderers";

export const helloWorldComponentRenderer = createComponentRenderer(
  "HelloWorld",
  undefined,
  () => <div>Hello, world!</div>
);
