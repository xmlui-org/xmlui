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
  },
});

export const optionComponentRenderer = createComponentRenderer(
  COMP,
  OptionMd,
  ({ node, extractValue, className, renderChild, layoutContext }) => {
    const label = extractValue.asOptionalString(node.props.label);
    const value = extractValue.asOptionalString(node.props.value);

    if (label === undefined && value === undefined) {
      return null;
    }

    const hasTextNodeChild = node.children?.length === 1 && (node.children[0].type === "TextNode" || node.children[0].type === "TextNodeCData");
    const textNodeChild = hasTextNodeChild ? renderChild(node.children) as string : undefined;

    return (
      <OptionNative
        label={label || textNodeChild}
        value={value || label}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        className={className}
        optionRenderer={
          node.children?.length > 0
            ? !hasTextNodeChild ? (contextVars) => (
              <MemoizedItem
                node={node.children}
                renderChild={renderChild}
                contextVars={contextVars}
                layoutContext={layoutContext}
              />
            ) : undefined
            : undefined
        }
      >
        {!hasTextNodeChild && renderChild(node.children)}
      </OptionNative>
    );
  },
);
