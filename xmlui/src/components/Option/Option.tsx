import { createMetadata } from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./Option.defaults";
import { OptionNative } from "./OptionReact";

const COMP = "Option";

export const OptionMd = createMetadata({
  status: "stable",
  description:
    "`Option` defines selectable items for choice-based components, providing both " +
    "the underlying value and display text for selection interfaces.",
  props: {
    label: {
      description:
        "This property defines the text to display for the option. If `label` is not defined, `Option` uses `value` as the label.",
      valueType: "string",
    },
    value: {
      description:
        "This property defines the value of the option. If `value` is not defined, `Option` uses `label` as the value.",
      valueType: "any",
    },
    testId: {
      description: "This property defines the test id for the option.",
      valueType: "string",
    },
    enabled: {
      description: "This boolean property indicates whether the option is enabled or disabled.",
      valueType: "boolean",
      defaultValue: defaultProps.enabled,
    },
    keywords: {
      description: "Keywords used by searchable choice components.",
      valueType: "string[]",
    },
  },
});

export const optionRenderer = wrapComponent({
  name: COMP,
  metadata: OptionMd,
  renderer: ({ adapter }) => (
    <OptionNative
      value={adapter.prop("value")}
      label={adapter.stringProp("label") ?? ""}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
    />
  ),
});
