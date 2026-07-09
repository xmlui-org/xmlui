import { wrapComponent } from "../../components-core/wrapComponent";
import { ThemedButton as Button } from "../Button/Button";
import { useInspectMode } from "../../components-core/InspectorContext";
import styles from "./InspectButton.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import type { CSSProperties, ReactNode } from "react";
import FileCodeIcon from "../Icon/svg/l-file-code.svg?react";
import { createMetadata } from "../metadata-helpers";
import classnames from "classnames";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "InspectButton";
export const InspectButtonMd = createMetadata({
  status: "experimental",
  description:
    "This component displays a button that can turn the inspection " +
    "mode of a running XMLUI app on or off.",
  props: {},
  themeVars: parseScssVar(styles.themeVars),
});

function InspectButton({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
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
      <FileCodeIcon className={styles.icon} />
      {children}
    </Button>
  );
}

/**
 * Define the renderer for the Button component
 */
export const inspectButtonComponentRenderer = wrapComponent(COMP, InspectButton, InspectButtonMd);

export const inspectButtonRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: InspectButtonMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const { inspectMode, setInspectMode } = useInspectMode();
    return (
      <span
        {...rootAttrs}
        data-inspect-mode={inspectMode ? "on" : "off"}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setInspectMode((previous: boolean) => !previous);
          }
        }}
      >
        <InspectButton
          style={rootAttrs.style as CSSProperties | undefined}
          className={rootAttrs.className as string | undefined}
        >
          {adapter.node.children.length > 0 ? adapter.renderChildren() : "Inspect"}
        </InspectButton>
      </span>
    );
  },
});
