import styles from "./ModalDialog.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { paddingSubject, textSubject } from "../../components-core/theming/themes/base-utils";
import { MemoizedItem } from "../container-helpers";
import { defaultProps } from "./ModalDialog.defaults";
import { ModalDialog, ModalDialogFrame } from "./ModalDialogReact";
import { createMetadata } from "../metadata-helpers";
import React from "react";
import { createPortal } from "react-dom";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { createSlotScope } from "../../runtime/rendering/components";
import { nonPropertyChildren, templateChildren, wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "ModalDialog";

export const ModalDialogMd = createMetadata({
  status: "stable",
  description:
    "`ModalDialog` creates overlay dialogs that appear on top of the main interface, " +
    "ideal for forms, confirmations, detailed views, or any content that requires " +
    "focused user attention. Dialogs are programmatically opened using the `open()` " +
    "method and can receive parameters for dynamic content.",
  optimization: {
    isImplicitContainerByDefault: true,
  },
  parts: {
    content: {
      description: "The main content area of the modal dialog.",
    },
    title: {
      description: "The title area of the modal dialog.",
    },
  },
  props: {
    fullScreen: {
      description:
        `Toggles whether the dialog encompasses the whole UI (\`true\`) or not and has a minimum ` +
        `width and height (\`false\`).`,
      valueType: "boolean",
      defaultValue: defaultProps.fullScreen,
    },
    title: {
      description: `Provides a prestyled heading to display the intent of the dialog.`,
      valueType: "string",
    },
    titleTemplate: {
      description: "A custom template to render the dialog title.",
      valueType: "ComponentDef",
    },
    closeButtonVisible: {
      description: `Shows (\`true\`) or hides (\`false\`) the visibility of the close button on the dialog.`,
      valueType: "boolean",
      defaultValue: defaultProps.closeButtonVisible,
    },
  },
  events: {
    open: {
      description:
        `This event is fired when the \`${COMP}\` is opened either via a \`when\` or an ` +
        `imperative API call (\`open()\`).`,
      signature: "open(...params: any[]): void",
      parameters: {
        params:
          "Parameters passed to the open() method, accessible via $param and $params context variables.",
      },
    },
    close: {
      description:
        `This event is fired when the close button is pressed or the user clicks outside ` +
        `the \`${COMP}\`.`,
      signature: "close(): void",
      parameters: {},
    },
  },
  apis: {
    close: {
      description:
        `This method is used to close the \`${COMP}\`. Invoke it using \`modalId.close()\` ` +
        `where \`modalId\` refers to a \`ModalDialog\` component.`,
      signature: "close(): void",
    },
    open: {
      description:
        "This method imperatively opens the modal dialog. You can pass an arbitrary number " +
        "of parameters to the method. In the `ModalDialog` instance, you can access those " +
        "with the `\$param` and `\$params` context values.",
      signature: "open(...params: any[]): void",
      parameters: {
        params: "An arbitrary number of parameters that can be used to pass data to the dialog.",
      },
    },
  },
  contextVars: {
    $param: {
      description: "First parameter passed to the `open()` method",
    },
    $params: {
      description:
        "Array of all parameters passed to `open()` method (access with `$params[0]`, `$params[1]`, etc.)",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    ...paddingSubject(COMP, { all: "$space-7" }),
    ...textSubject(`title-${COMP}`, { size: "$fontSize-2xl" }),
    [`backgroundColor-${COMP}`]: "$backgroundColor-primary",
    [`backgroundColor-overlay-${COMP}`]: "$backgroundColor-overlay",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`maxWidth-${COMP}`]: "450px",
    [`maxHeight-${COMP}`]: "100%",
    [`marginBottom-title-${COMP}`]: "0",
  },
});

type ThemedModalDialogProps = React.ComponentPropsWithoutRef<typeof ModalDialog>;

export const ThemedModalDialog = React.forwardRef<
  React.ElementRef<typeof ModalDialog>,
  ThemedModalDialogProps
>(function ThemedModalDialog({ className, ...props }, ref) {
  const themeClass = useComponentThemeClass(ModalDialogMd);
  return (
    <ModalDialog
      {...props}
      className={`${themeClass}${className ? ` ${className}` : ""}`}
      ref={ref}
    />
  );
});

export const modalViewComponentRenderer = wrapComponent(COMP, ModalDialog, ModalDialogMd, {
  exposeRegisterApi: true,
  exclude: ["fullScreen", "title", "titleTemplate", "closeButtonVisible", "externalAnimation"],
  events: [],
  customRender(
    _props,
    {
      node,
      contextVars,
      extractValue,
      classes,
      renderChild,
      lookupEventHandler,
      registerComponentApi,
      layoutContext,
    },
  ) {
    // --- If the ModalDialog is not inside a ModalDialogFrame, wrap it in one.
    if (!layoutContext?._insideModalFrame) {
      // --- Context variables are now directly available via contextVars parameter
      return (
        <ModalDialogFrame
          isInitiallyOpen={extractValue(node.when) !== undefined}
          registerComponentApi={registerComponentApi}
          renderDialog={({ openParams, ref }) => {
            return (
              <MemoizedItem
                node={node}
                renderChild={renderChild}
                layoutContext={{ _insideModalFrame: true }}
                contextVars={{
                  ...contextVars,
                  $param: openParams?.[0],
                  $params: openParams,
                }}
                vars={(node as any)._savedVarDefs}
                functions={(node as any)._savedFunctionDefs}
              />
            );
          }}
        />
      );
    }

    return (
      <ModalDialog
        classes={classes}
        fullScreen={extractValue.asOptionalBoolean(node.props?.fullScreen)}
        title={extractValue(node.props?.title)}
        titleTemplate={renderChild(node.props?.titleTemplate)}
        closeButtonVisible={extractValue.asOptionalBoolean(node.props.closeButtonVisible)}
        externalAnimation={extractValue.asOptionalBoolean(node.props.externalAnimation)}
        onClose={lookupEventHandler("close")}
        onOpen={lookupEventHandler("open")}
      >
        {renderChild(node.children, { type: "Stack" })}
      </ModalDialog>
    );
  },
});

Object.assign(ModalDialogMd.defaultThemeVars ??= {}, {
  [`backgroundColor-overlay-${COMP}`]: "rgba(0, 0, 0, 0.2)",
  [`fontFamily-title-${COMP}`]:
    "'Inter', -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif",
  [`fontSize-title-${COMP}`]: "1.5em",
  [`fontWeight-title-${COMP}`]: "400",
  [`textColor-title-${COMP}`]: "$textColor-primary",
});

export const modalDialogRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: ModalDialogMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    delete rootAttrs["data-part-id"];
    rootAttrs["data-testid"] = adapter.stringProp(
      "testId",
      adapter.stringProp("id", undefined),
    );
    const contentChildren = modalContentChildren(adapter.node);
    const hasTitleTemplate = adapter.node.children.some(
      (child) =>
        child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "titleTemplate",
    );

    return (
      <ModalDialogFrame
        isInitiallyOpen={Object.prototype.hasOwnProperty.call(adapter.props, "when")}
        registerComponentApi={adapter.registerApi}
        renderDialog={({ openParams, ref }) => {
          const params = Array.isArray(openParams) ? openParams : [];
          const slotScope = createSlotScope(adapter.scope, {
            $param: params[0],
            $params: params,
          });
          const titleTemplate = hasTitleTemplate
            ? adapter.context.renderChildren(
                templateChildren(adapter.node, "titleTemplate") ?? [],
                slotScope,
                adapter.node.range.end,
              )
            : undefined;
          const title = adapter.node.props.title === undefined
            ? undefined
            : String(evaluateExpressionOrText(
                adapter.node.props.title,
                adapter.node.parsed?.props?.title,
                slotScope,
                "ModalDialog:title",
              ));

          return (
            <ModalDialogWithTooltip
              {...rootAttrs}
              ref={ref as React.Ref<HTMLDivElement>}
              classes={{ "-component": adapter.className }}
              style={rootAttrs.style as React.CSSProperties}
              fullScreen={adapter.booleanProp("fullScreen", defaultProps.fullScreen)}
              title={title}
              titleTemplate={titleTemplate}
              closeButtonVisible={adapter.booleanProp(
                "closeButtonVisible",
                defaultProps.closeButtonVisible,
              )}
              externalAnimation={adapter.booleanProp("externalAnimation", true)}
              tooltip={adapter.stringProp("tooltip")}
              tooltipMarkdown={adapter.stringProp("tooltipMarkdown")}
              onClose={async () =>
                (await adapter.event("close")()) === false ? false : undefined}
              onOpen={() => {
                void adapter.event("open")(...params);
              }}
            >
              {adapter.context.renderChildren(
                contentChildren,
                slotScope,
                adapter.node.range.end,
                { type: "Stack" },
              )}
            </ModalDialogWithTooltip>
          );
        }}
      />
    );
  },
});

type ModalDialogWithTooltipProps = React.ComponentPropsWithoutRef<typeof ModalDialog> & {
  tooltip?: string;
  tooltipMarkdown?: string;
};

const ModalDialogWithTooltip = React.forwardRef<
  React.ElementRef<typeof ModalDialog>,
  ModalDialogWithTooltipProps
>(function ModalDialogWithTooltip(
  { tooltip, tooltipMarkdown, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props },
  ref,
) {
  const [visible, setVisible] = React.useState(false);
  const content = tooltipMarkdown || tooltip;
  return (
    <>
      <ModalDialog
        {...props}
        ref={ref}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          setVisible(true);
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          setVisible(false);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          setVisible(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setVisible(false);
        }}
      />
      {visible && content && typeof document !== "undefined"
        ? createPortal(
            <span role="tooltip">
              {tooltipMarkdown ? renderTinyTooltipMarkdown(tooltipMarkdown) : content}
            </span>,
            document.body,
          )
        : null}
    </>
  );
});

function renderTinyTooltipMarkdown(markdown: string) {
  const strongMatch = /^\*\*(.*)\*\*$/.exec(markdown.trim());
  return strongMatch ? <strong>{strongMatch[1]}</strong> : markdown;
}

function modalContentChildren(node: XmluiElement): XmluiNode[] {
  const children = nonPropertyChildren(node.children);
  const vars: Record<string, string> = {};
  const parsedVars: NonNullable<XmluiElement["parsed"]>["vars"] = {};
  const renderedChildren: XmluiNode[] = [];

  for (const child of children) {
    if (child.kind === "element" && child.type === "variable") {
      const name = child.props.name;
      if (name) {
        vars[name] = child.props.value ?? "";
        const parsedValue = child.parsed?.props?.value;
        if (parsedValue) {
          parsedVars[name] = parsedValue;
        }
      }
      continue;
    }
    renderedChildren.push(child);
  }

  if (Object.keys(vars).length === 0) {
    return renderedChildren;
  }

  return [{
    kind: "element",
    type: "Fragment",
    props: {},
    vars,
    globals: {},
    events: {},
    methods: {},
    children: renderedChildren,
    range: node.range,
    ...(Object.keys(parsedVars).length > 0 ? { parsed: { vars: parsedVars } } : {}),
  }];
}
