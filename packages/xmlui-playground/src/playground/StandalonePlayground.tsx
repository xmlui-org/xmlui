import { createMetadata, createUserDefinedComponentRenderer, parseScssVar } from "xmlui";
import componentSource from "./StandalonePlayground/StandalonePlayground.xmlui";

const COMP = "StandalonePlayground";

export const StandalonePlaygroundMd = createMetadata({
  description: "XMLUI StandalonePlayground component.",
  status: "experimental",
  props: {},
  themeVars: parseScssVar({}),
  defaultThemeVars: {},
});

export const standalonePlaygroundComponentRenderer = createUserDefinedComponentRenderer(
  StandalonePlaygroundMd,
  componentSource,
);
