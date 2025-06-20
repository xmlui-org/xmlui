import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import { DevTools } from "./DevToolsNative";

const COMP = "DevTools";

export const EditorMd = createMetadata({
  description: "XMLUI DevTools component.",
  status: "experimental",
  props: {
  },
  themeVars: parseScssVar({
  }),
  defaultThemeVars: {
    "duration-startAnimation-ModalDialog": "600ms"
  },
});

export const devToolsComponentRenderer = createComponentRenderer(
  COMP,
  EditorMd,
  ({ extractValue, node, layoutCss, renderChild }: any) => {
    return (
      <DevTools />
    );
  },
);
