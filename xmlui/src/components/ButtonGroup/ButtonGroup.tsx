import { createMetadata, d } from "@abstractions/ComponentDefs";

import styles from "./ButtonGroup.module.scss";

import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { ButtonGroup } from "./ButtonGroupNative";
import { buttonThemeMd, buttonVariantMd } from "@components/abstractions";
import { dOrientation } from "@components/metadata-helpers";

const COMP = "ButtonGroup";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/button-group/
// Use the same techinque for borders and radius as the Accordion component.

export const ButtonGroupMd = createMetadata({
  status: "in review",
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
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return <ButtonGroup />;
  },
);
