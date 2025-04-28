import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { Button } from "../Button/ButtonNative";
import { useInspectMode } from "../../components-core/InspectorContext";
import styles from "./InspectButton.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { CSSProperties, ReactNode } from "react";

const COMP = "InspectButton";
export const InspectButtonMd = createMetadata({
  status: "experimental",
  description:
    "This component displays a button that can turn the inspection " +
    "mode of a running XMLUI app on or off.",
  props: {},
  themeVars: parseScssVar(styles.themeVars),
});

function InspectButton({ children, style }: { children: ReactNode; style: CSSProperties }) {
  const { setInspectMode, inspectMode } = useInspectMode();

  return (
    <Button
      style={style}
      themeColor={inspectMode ? "primary" : "secondary"}
      variant={inspectMode ? "solid" : "outlined"}
      onClick={() => {
        setInspectMode((prev: any) => !prev);
      }}
    >
      {children}
    </Button>
  );
}

/**
 * Define the renderer for the Button component
 */
export const inspectButtonComponentRenderer = createComponentRenderer(
  COMP,
  InspectButtonMd,
  ({ renderChild, node, layoutCss }) => {
    return <InspectButton style={layoutCss}>{renderChild(node.children)}</InspectButton>;
  },
);
