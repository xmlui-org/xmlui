import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import { DevTools } from "./DevToolsReact";

const COMP = "DevTools";

export const EditorMd = createMetadata({
  description: "XMLUI DevTools component.",
  status: "experimental",
  props: {
  },
  themeVars: parseScssVar({
  }),
  defaultThemeVars: {},
});

export const devToolsComponentRenderer = createComponentRenderer(
  COMP,
  EditorMd,
  ({ extractValue, node, renderChild }: any) => {
    return (
      <DevTools />
    );
  },
);
