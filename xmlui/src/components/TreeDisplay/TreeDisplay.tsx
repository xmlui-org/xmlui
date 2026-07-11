import { createMetadata, dContextMenu } from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./TreeDisplay.defaults";
import { TreeDisplay } from "./TreeDisplayReact";

const COMP = "TreeDisplay";

export const ThemedTreeDisplay = TreeDisplay;

const treeDisplayStylesSource = `
$backgroundColor-TreeDisplay: createThemeVar("backgroundColor-TreeDisplay");
$border-TreeDisplay: createThemeVar("border-TreeDisplay");
$borderRadius-TreeDisplay: createThemeVar("borderRadius-TreeDisplay");
$boxShadow-TreeDisplay: createThemeVar("boxShadow-TreeDisplay");
$color-TreeDisplay: createThemeVar("color-TreeDisplay");
$fontFamily-TreeDisplay: createThemeVar("fontFamily-TreeDisplay");
$fontSize-TreeDisplay: createThemeVar("fontSize-TreeDisplay");
$fontWeight-TreeDisplay: createThemeVar("fontWeight-TreeDisplay");
$itemHeight-TreeDisplay: createThemeVar("itemHeight-TreeDisplay");
$padding-TreeDisplay: createThemeVar("padding-TreeDisplay");
$paddingLeft-TreeDisplay: createThemeVar("paddingLeft-TreeDisplay");
`;

export const TreeDisplayMd = createMetadata({
  status: "experimental",
  description: "`TreeDisplay` displays indented text as a tree structure.",
  props: {
    content: { description: "Indented text content.", valueType: "string", defaultValue: defaultProps.content },
    itemHeight: { description: "Item height in pixels.", valueType: "number", defaultValue: defaultProps.itemHeight },
  },
  events: {
    contextMenu: dContextMenu(COMP),
  },
  themeVars: extractScssThemeVars(treeDisplayStylesSource),
  defaultThemeVars: {
    "backgroundColor-TreeDisplay": "$backgroundColor-CodeBlock",
    "border-TreeDisplay": "0.5px solid $borderColor",
    "borderRadius-TreeDisplay": "8px",
    "boxShadow-TreeDisplay": "none",
    "color-TreeDisplay": "$textColor-primary",
    "fontFamily-TreeDisplay": "$fontFamily-monospace",
    "fontSize-TreeDisplay": "$fontSize-code",
    "fontWeight-TreeDisplay": "$fontWeight-normal",
    "itemHeight-TreeDisplay": `${defaultProps.itemHeight}px`,
    "padding-TreeDisplay": "$space-4",
    "paddingLeft-TreeDisplay": "$space-2",
  },
});

export const treeDisplayRenderer = wrapComponent({
  name: COMP,
  metadata: TreeDisplayMd,
  renderer: ({ adapter }) => {
    const content = adapter.stringProp("content");
    return (
      <TreeDisplay
        {...adapter.rootAttrs()}
        content={content ?? directTextContent(adapter.node.children) ?? defaultProps.content}
        itemHeight={adapter.numberProp("itemHeight", defaultProps.itemHeight)}
        onContextMenu={adapter.node.events.contextMenu ? ((event) => void adapter.event("contextMenu")(event)) : undefined}
      />
    );
  },
});

function directTextContent(children: unknown[]): string | undefined {
  const text = children
    .map((child) => child && typeof child === "object" && (child as { kind?: unknown }).kind === "text"
      ? String((child as { value?: unknown }).value ?? "")
      : "")
    .join("");
  return text.trim().length > 0 ? text : undefined;
}
