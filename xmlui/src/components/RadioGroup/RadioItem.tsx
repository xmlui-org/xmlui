import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata, dDidChange } from "../metadata-helpers";
import { RadioItem, defaultProps } from "./RadioItemNative";

const COMP = "RadioItem";

export const RadioItemMd = createMetadata({
  status: "experimental",
  description: `The \`${COMP}\` component is a radio button that is part of a group of radio buttons.`,
  props: {
    checked: {
      description: "This property specifies whether the radio button is checked.",
      defaultValue: defaultProps.checked,
    },
    value: {
      description: "This property specifies the value of the radio button.",
      defaultValue: defaultProps.value,
    },
  },
  events: {
    didChange: dDidChange(COMP),
  },
});

export const radioItemComponentRenderer = wrapComponent(COMP, RadioItem, RadioItemMd, {
  stateful: false,
  booleans: ["checked"],
});
