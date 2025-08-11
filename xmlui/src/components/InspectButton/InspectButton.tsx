import { createComponentRenderer } from "../../components-core/renderers";
import { Button } from "../Button/ButtonNative";
import { useInspectMode } from "../../components-core/InspectorContext";
import styles from "./InspectButton.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { CSSProperties, ReactNode } from "react";
import { PiFileCode } from "react-icons/pi";
import { createMetadata } from "../metadata-helpers";

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
      className={styles.inspectButton}
      themeColor={inspectMode ? "primary" : "secondary"}
      variant={inspectMode ? "solid" : "outlined"}
      onClick={() => {
        setInspectMode((prev: any) => !prev);
      }}
    >
      <PiFileCode className={styles.icon}/>
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
