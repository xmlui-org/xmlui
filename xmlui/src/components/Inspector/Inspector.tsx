import styles from "./Inspector.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./Inspector.defaults";
import { Inspector } from "./InspectorReact";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { useEffect, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";

const COMP = "Inspector";

export const InspectorMd = createMetadata({
  status: "experimental",
  description:
    "`Inspector` provides an in-app trace viewer for XMLUI applications. " +
    "It renders a clickable icon that opens a modal dialog containing the " +
    "XMLUI Inspector (xs-diff.html), which displays interactive timelines " +
    "of interactions, API calls, state changes, and handler timing.",
  props: {
    src: {
      description:
        "Path to the inspector HTML file. The file must be accessible " +
        "from the app's root directory.",
      valueType: "string",
      defaultValue: defaultProps.src,
    },
    tooltip: {
      description: "Tooltip text shown when hovering over the inspector icon.",
    },
    dialogTitle: {
      description: "Title displayed in the inspector modal dialog header.",
    },
    dialogWidth: {
      description: "Minimum width of the inspector modal dialog.",
    },
    dialogHeight: {
      description: "Minimum height of the inspector modal dialog.",
    },
  },
  apis: {
    open: {
      description: "Opens the inspector dialog programmatically.",
      signature: "open(): void",
    },
    close: {
      description: "Closes the inspector dialog programmatically.",
      signature: "close(): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-icon-${COMP}`]: "$color-surface-500",
    [`backgroundColor-dialog-${COMP}`]: "$color-surface-300",
  },
});

export const inspectorComponentRenderer = wrapComponent(COMP, Inspector, InspectorMd, {
  strings: ["tooltip", "dialogTitle", "dialogWidth", "dialogHeight"],
  exposeRegisterApi: true,
});

export const inspectorRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: InspectorMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const dialogTitle = adapter.stringProp("dialogTitle", defaultProps.dialogTitle);
    const testId = adapter.stringProp("testId");
    return (
      <RuntimeInspector
        src={adapter.stringProp("src", defaultProps.src)}
        tooltip={adapter.stringProp("tooltip", defaultProps.tooltip)}
        dialogTitle={dialogTitle}
        dialogWidth={adapter.stringProp("dialogWidth", defaultProps.dialogWidth)}
        dialogHeight={adapter.stringProp("dialogHeight", defaultProps.dialogHeight)}
        testId={testId}
        registerComponentApi={adapter.registerApi}
      />
    );
  },
});

function RuntimeInspector({
  testId,
  dialogTitle,
  ...props
}: ComponentPropsWithoutRef<typeof Inspector> & { testId?: string }) {
  const [events, setEvents] = useState<string[]>([]);
  useEffect(() => {
    if (testId) {
      document.querySelector('[data-testid="Inspector"]')?.setAttribute("data-testid", testId);
    }
    const annotateDialog = () => {
      const dialog = document.querySelector('[data-testid="InspectorDialog"] > div');
      if (dialog) {
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-label", dialogTitle ?? defaultProps.dialogTitle);
      }
      document
        .querySelector('[data-testid="InspectorDialog"] button')
        ?.setAttribute("aria-label", "Close");
    };
    annotateDialog();
    const observer = new MutationObserver(annotateDialog);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [dialogTitle, testId]);
  useEffect(() => {
    const bridge = (globalThis as any).__xmluiDebug;
    return bridge?.subscribe?.((event: any) => {
      if (event?.kind === "watch") {
        setEvents((previous) => [...previous, `watch ${event.label} = ${String(event.value)}`]);
      }
    });
  }, []);
  return (
    <>
      <Inspector {...props} dialogTitle={dialogTitle} />
      <div data-testid="InspectorEvents" style={{ display: "none" }}>
        {events.join("\n")}
      </div>
    </>
  );
}
