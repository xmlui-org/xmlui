import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { RadioItem } from "./RadioItemNative";

const COMP = "RadioItem";

export const RadioItemMd = createMetadata({
  status: "experimental",
  description: `The \`${COMP}\` component is a radio button that is part of a group of radio buttons.`,
  props: {
    checked: d("This property specifies whether the radio button is checked."),
    value: d("This property specifies the value of the radio button."),
  },
});

export const radioItemComponentRenderer = createComponentRenderer(
  COMP,
  RadioItemMd,
  ({ node, extractValue }) => {
    return (
      <RadioItem
        checked={extractValue(node.props.checked)}
        value={extractValue(node.props.value)}
      />
    );
  },
);
