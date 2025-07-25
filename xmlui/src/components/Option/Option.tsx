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
      "This property defines the value of the option. If \`value\` is not defined, " +
        "\`Option\` will use the \`label\` as the value. If neither is defined, " +
        "the option is not displayed.",
    ),
    enabled: {
      description: "This boolean property indicates whether the option is enabled or disabled.",
      valueType: "boolean",
      defaultValue: defaultProps.enabled,
    },
    optionTemplate: d("This property is used to define a custom option template"),
  },
  childrenAsTemplate: "optionTemplate",
});

export const optionComponentRenderer = createComponentRenderer(
  COMP,
  OptionMd,
  ({ node, extractValue, layoutCss, renderChild, layoutContext }) => {
    const optionTemplate = node.props.optionTemplate;

    const label = extractValue.asOptionalString(node.props.label) || extractValue(node.props.value);
    const value = extractValue.asOptionalString(node.props.value) || extractValue(node.props.label);
    if (label === undefined) {
      return null;
    }
    return (
      <OptionNative
        optionRenderer={
          optionTemplate
            ? (contextVars) => (
                <MemoizedItem
                  node={optionTemplate}
                  renderChild={renderChild}
                  contextVars={contextVars}
                  layoutContext={layoutContext}
                />
              )
            : undefined
        }
        label={label}
        value={value}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        style={layoutCss}
      />
    );
  },
);
