import { createComponentRenderer } from "../../components-core/renderers";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, d } from "../metadata-helpers";
import { OptionNative, defaultProps } from "./OptionNative";

const COMP = "Option";

export const OptionMd = createMetadata({
  status: "stable",
  description:
    "`Option` defines selectable items for choice-based components, providing both " +
    "the underlying value and display text for selection interfaces. It serves as " +
    "a non-visual data structure that describes individual choices within " +
    "[Select](/components/Select), [AutoComplete](/components/AutoComplete), " +
    "and other selection components. You can add any custom properties (e.g., `type`, `category`) " +
    "to `Option` components for use with grouping features.",
  props: {
    label: d(
      `This property defines the text to display for the option. If \`label\` is not defined, ` +
        `\`Option\` will use the \`value\` as the label.`,
    ),
    value: d(
      "This property defines the value of the option. If `value` is not defined, " +
        "`Option` will use the `label` as the value. If neither is defined, " +
        "the option is not displayed.",
    ),
    enabled: {
      description: "This boolean property indicates whether the option is enabled or disabled.",
      valueType: "boolean",
      defaultValue: defaultProps.enabled,
    },
    keywords: d(
      "An array of keywords that can be used for searching and filtering the option. " +
        "These keywords are not displayed but help users find the option through search.",
    ),
  },
});

export const optionComponentRenderer = createComponentRenderer(
  COMP,
  OptionMd,
  ({ node, extractValue, className, renderChild, layoutContext }) => {
    const label = extractValue.asOptionalString(node.props.label);
    let value = extractValue(node.props.value);
    if (label === undefined && value === undefined) {
      return null;
    }

    const hasTextNodeChild =
      node.children?.length === 1 &&
      (node.children[0].type === "TextNode" || node.children[0].type === "TextNodeCData");
    const textNodeChild = hasTextNodeChild ? (renderChild(node.children) as string) : undefined;

    // Collect all extra properties for grouping support
    const extraProps: any = {};
    const knownProps = ["label", "value", "enabled", "keywords", "children", "className", "style"];
    Object.keys(node.props).forEach((key) => {
      if (!knownProps.includes(key) && node.props[key] !== undefined) {
        extraProps[key] = extractValue(node.props[key]);
      }
    });

    return (
      <OptionNative
        label={label || textNodeChild}
        value={value !== undefined && value !== "" ? value : label}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        keywords={extractValue.asOptionalStringArray(node.props.keywords)}
        className={className}
        {...extraProps}
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
      >
        {!hasTextNodeChild && renderChild(node.children)}
      </OptionNative>
    );
  },
);
