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
    "and other selection components.",
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
        label={label}
        value={value !== undefined && value !== "" ? value : label}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        keywords={extractValue.asOptionalStringArray(node.props.keywords)}
        className={className}
        {...extraProps}
        optionRenderer={
          node.children?.length > 0
            ? (contextVars) => (
                <MemoizedItem
                  node={node.children}
                  renderChild={renderChild}
                  contextVars={contextVars}
                  layoutContext={layoutContext}
                />
              )
            : undefined
        }
      >
        {renderChild(node.children)}
      </OptionNative>
    );
  },
);
