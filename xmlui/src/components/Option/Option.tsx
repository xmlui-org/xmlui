import { wrapComponent } from "../../components-core/wrapComponent";
import { MemoizedItem } from "../container-helpers";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./Option.defaults";
import { OptionNative } from "./OptionReact";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { createRuntimeScope } from "../../runtime/state";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { createContext, useContext } from "react";

const COMP = "Option";

export const OptionMd = createMetadata({
  status: "stable",
  description:
    "`Option` defines selectable items for choice-based components, providing both " +
    "the underlying value and display text for selection interfaces. It serves as " +
    "a non-visual data structure that describes individual choices within " +
    "[Select](/components/Select), [AutoComplete](/components/AutoComplete), " +
    "and other selection components.",
  props: {
    label: {
      description:
        `This property defines the text to display for the option. If \`label\` is not defined, ` +
        `\`Option\` will use the \`value\` as the label.`,
      valueType: "string",
    },
    value: {
      description:
        "This property defines the value of the option. If `value` is not defined, " +
        "`Option` will use the `label` as the value. If neither is defined, " +
        "the option is not displayed.",
    },
    enabled: {
      description: "This boolean property indicates whether the option is enabled or disabled.",
      valueType: "boolean",
      defaultValue: defaultProps.enabled,
    },
    keywords: {
      description:
        "An array of keywords that can be used for searching and filtering the option. " +
        "These keywords are not displayed but help users find the option through search.",
      valueType: "string[]",
    },
  },
});

export const optionComponentRenderer = wrapComponent(COMP, OptionNative, OptionMd, {
  exclude: ["label", "value", "enabled", "keywords"],
  customRender(_props, { node, extractValue, classes, renderChild, layoutContext }) {
    const label = extractValue.asOptionalString(node.props.label);
    let value = extractValue(node.props.value);
    if (label === undefined && value === undefined) {
      return null;
    }

    const hasTextNodeChild =
      node.children?.length === 1 &&
      (node.children[0].type === "TextNode" || node.children[0].type === "TextNodeCData");
    const textNodeChild = hasTextNodeChild ? (renderChild(node.children) as string) : undefined;

    // Extract all extra properties (like category, etc.) for grouping and filtering
    const extraProps: Record<string, any> = {};
    const knownProps = new Set(["label", "value", "enabled", "keywords"]);
    Object.keys(node.props).forEach((key) => {
      if (!knownProps.has(key)) {
        extraProps[key] = extractValue(node.props[key]);
      }
    });

    return (
      <OptionNative
        label={label || textNodeChild}
        value={value !== undefined && value !== "" ? value : label}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        keywords={extractValue.asOptionalStringArray(node.props.keywords)}
        className={classes?.[COMPONENT_PART_KEY]}
        optionRenderer={
          node.children?.length > 0
            ? !hasTextNodeChild
              ? (contextVars) => (
                  <MemoizedItem
                    node={node.children}
                    renderChild={renderChild}
                    contextVars={contextVars}
                    layoutContext={layoutContext}
                  />
                )
              : undefined
            : undefined
        }
        {...extraProps}
      >
        {!hasTextNodeChild && renderChild(node.children)}
      </OptionNative>
    );
  },
});

export const RuntimeOptionClassContext = createContext<string | undefined>(undefined);

export const optionRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: OptionMd as ComponentMetadata,
  renderer: ({ adapter }) => <RuntimeOption adapter={adapter} />,
});

function RuntimeOption({ adapter }: { adapter: XmluiComponentAdapter }) {
  const parentOptionClassName = useContext(RuntimeOptionClassContext);
  const label = adapter.stringProp("label");
  const value = adapter.prop("value");
  if (label === undefined && value === undefined) {
    return null;
  }

  const hasTextNodeChild =
    adapter.node.children.length === 1 && adapter.node.children[0].kind === "text";
  const textNodeChild = hasTextNodeChild
    ? adapter.node.children[0].value
    : undefined;

  const extraProps: Record<string, unknown> = {};
  const knownProps = new Set(["label", "value", "enabled", "keywords"]);
  for (const key of Object.keys(adapter.props)) {
    if (!knownProps.has(key)) {
      extraProps[key] = adapter.props[key];
    }
  }

  return (
    <OptionNative
      label={label || textNodeChild}
      value={value !== undefined && value !== "" ? value : label}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
      keywords={adapter.prop("keywords") as string[] | undefined}
      className={[parentOptionClassName, adapter.className].filter(Boolean).join(" ")}
      optionRenderer={
        adapter.node.children.length > 0 && !hasTextNodeChild
          ? (contextVars) => {
              const optionScope = createRuntimeScope({
                store: adapter.scope.store,
                parent: adapter.scope,
                props: adapter.scope.props,
                contextValues: contextVars,
                references: adapter.scope.references,
                slots: adapter.scope.slots,
                emitEvent: adapter.scope.emitEvent,
              });
              return adapter.context.renderChildren(
                adapter.node.children,
                optionScope,
                adapter.node.range.end,
              );
            }
          : undefined
      }
      {...extraProps}
    >
      {adapter.node.children.length > 0 && !hasTextNodeChild
        ? adapter.renderChildren(adapter.node.children)
        : undefined}
    </OptionNative>
  );
}
