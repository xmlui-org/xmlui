import styles from "./ButtonGroup.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { buttonThemeMd, buttonVariantMd } from "../abstractions";
import { dOrientation } from "../metadata-helpers";
import { ButtonGroup } from "./ButtonGroupNative";

const COMP = "ButtonGroup";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/button-group/
// Use the same techinque for borders and radius as the Accordion component.

export const ButtonGroupMd = createMetadata({
  status: "in progress",
  description:
    `(**NOT IMPLEMENTED YET**) The \`${COMP}\` component is a container that embeds buttons used ` +
    `together for a particular reason. It provides a view that emphasizes this coherency.`,
  props: {
    themeColor: d(
      `This optional property specifies the default theme color for the buttons in the group. ` +
        `Individual buttons may override this setting with their \`themeColor\` property.`,
      buttonThemeMd,
      "string",
      "primary",
    ),
    variant: d(
      `This optional property specifies the default variant for the buttons in the group. ` +
        `Individual buttons may override this setting with their \`variant\` property.`,
      buttonVariantMd,
      "string",
      "solid",
    ),
    orientation: dOrientation("horizontal"),
    buttonWidth: d(
      `When this optional property is set, all buttons within the group will have the ` +
        `specified width. If it is empty, each button's width accommodates its content.`,
    ),
    gap: d(
      `When this optional property is set, adjacent buttons will have the specified gap ` +
        `between them. If this property is not set, the buttons will be merged into one group.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    light: {},
    dark: {},
  },
});

export const buttonGroupComponentRenderer = createComponentRenderer(
  COMP,
  ButtonGroupMd,
  ({}) => {
    return <ButtonGroup />;
  },
);
