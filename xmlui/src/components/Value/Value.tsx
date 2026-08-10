import styles from "./Value.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata } from "../metadata-helpers";
import { Value } from "./ValueReact";

const COMP = "Value";

export const ValueMd = createMetadata({
  status: "stable",
  description:
    "`Value` displays a read-only value with optional type-aware formatting. Use it " +
    "for scalar values, structured values, links, dates, numbers, currencies, images, " +
    "avatars, icons, JSON, enum labels, and similar display-only output outside tables.",
  props: {
    value: {
      description:
        "The raw value to display. `Value` formats this value for display only; it does " +
        "not validate, convert, or mutate the underlying data. Nullish values render empty " +
        "except with `type=\"json\"`, which displays `null`.",
      valueType: "any",
    },
    type: {
      description:
        "A display hint for the value. Use compact values such as `text`, `email`, " +
        "`number(8,3)`, `currency(USD)`, `date(short)`, `datetime`, `boolean`, `enum`, " +
        "`image`, or `json` to select common read-only formatting behavior. The type " +
        "affects display only.",
      valueType: "string",
    },
    typeOptions: {
      description:
        "Additional display options for the selected type. Use it for object-shaped " +
        "configuration, such as enum/status label maps, link labels, image/avatar alt text, " +
        "locale overrides, and long-text options such as `maxLines`. Values in `typeOptions` " +
        "override compact options specified in the `type` string.",
      valueType: "any",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderColor-${COMP}`]: "$borderColor",
  },
});

export const valueComponentRenderer = wrapComponent(COMP, Value, ValueMd);
