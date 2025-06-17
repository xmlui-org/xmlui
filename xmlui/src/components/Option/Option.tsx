import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import type { Option } from "../abstractions";
import { dEnabled } from "../metadata-helpers";
import { MemoizedItem } from "../container-helpers";
import { OptionNative, defaultProps } from "./OptionNative";

const COMP = "Option";

export const OptionMd = createMetadata({
  description:
    `\`${COMP}\` is a non-visual component describing a selection option. Other components ` +
    `(such as \`Select\`, \`AutoComplete\`, and others) may use nested \`Option\` instances ` +
    `from which the user can select.`,
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
