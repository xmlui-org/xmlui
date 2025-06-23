import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import type { Option } from "../abstractions";
import { dEnabled } from "../metadata-helpers";
import { MemoizedItem } from "../container-helpers";
import { OptionNative, defaultProps } from "./OptionNative";

const COMP = "Option";

export const OptionMd = createMetadata({
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
        value={extractValue(node.props.value)}
        label={extractValue.asOptionalString(node.props.label) || extractValue(node.props.value)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        style={layoutCss}
      />
    );
  },
);
