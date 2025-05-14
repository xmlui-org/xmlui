import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import { StandalonePlayground } from "./StandalonePlaygroundNative";

const COMP = "StandalonePlayground";

export const StandalonePlaygroundMd = createMetadata({
  description: "XMLUI StandalonePlayground component.",
  status: "experimental",
  props: {},
  themeVars: parseScssVar({}),
  defaultThemeVars: {},
});

export const standalonePlaygroundComponentRenderer = createComponentRenderer(
  COMP,
  StandalonePlaygroundMd,
  () => {
    return <StandalonePlayground />;
  },
);
