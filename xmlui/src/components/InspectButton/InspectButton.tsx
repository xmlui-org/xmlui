import { createComponentRenderer } from "../../components-core/renderers";
import { Button } from "../Button/ButtonNative";
import { useInspectMode } from "../../components-core/InspectorContext";
import styles from "./InspectButton.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import type { CSSProperties, ReactNode } from "react";
import { PiFileCode } from "react-icons/pi";
import { createMetadata } from "../metadata-helpers";
import classnames from "classnames";

const COMP = "InspectButton";
export const InspectButtonMd = createMetadata({
  status: "experimental",
  description:
    "This component displays a button that can turn the inspection " +
    "mode of a running XMLUI app on or off.",
  props: {},
  themeVars: parseScssVar(styles.themeVars),
});

function InspectButton({ children, style, className }: { children: ReactNode; style?: CSSProperties, className?: string }) {
  const { setInspectMode, inspectMode } = useInspectMode();

  return (
    <Button
      style={style}
      className={classnames(styles.inspectButton, className)}
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
  ({ renderChild, node, className }) => {
    return <InspectButton className={className}>{renderChild(node.children)}</InspectButton>;
  },
);
