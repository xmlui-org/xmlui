import styles from "./AppHeader.module.scss";

import { createMetadata, d } from "@abstractions/ComponentDefs";

import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { borderSubject, paddingSubject } from "@components-core/theming/themes/base-utils";
import { AppContextAwareAppHeader } from "./AppHeaderNative";
import { dComponent } from "@components/metadata-helpers";

const COMP = "AppHeader";

export const AppHeaderMd = createMetadata({
  status: "experimental",
  description: `\`${COMP}\` is a placeholder within \`App\` to define a custom application header.`,
  props: {
    profileMenuTemplate: dComponent(
      `This property makes the profile menu slot of the \`${COMP}\` component customizable.`,
    ),
    logoTemplate: dComponent(
      `This property defines the template to use for the logo. With this property, you can ` +
        `construct your custom logo instead of using a single image.`,
    ),
    logoTitle: d("Title for the application logo"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "height-AppHeader": "$space-14",
    "max-content-width-AppHeader": "$max-content-width-App",
    ...borderSubject("AppHeader", {
      bottom: {
        color: "$color-border",
        thickness: "1px",
        style: "solid",
      },
      all: {
        color: "$color-border",
        thickness: "0",
        style: "solid",
      },
    }),
    ...paddingSubject("logo-AppHeader", { horizontal: "$space-0", vertical: "$space-4" }),
    ...paddingSubject("AppHeader", { horizontal: "$space-4", vertical: "$space-0" }),
    "radius-AppHeader": "0px",
    light: {
      "color-bg-AppHeader": "white",
    },
    dark: {
      "color-bg-AppHeader": "$color-surface-900",
    },
  },
});

export const appHeaderComponentRenderer = createComponentRenderer(
  COMP,
  AppHeaderMd,
  ({ node, renderChild, layoutCss, layoutContext, extractValue }) => {
    // --- Convert the plain (text) logo template into component definition
    let logoTemplate = node.props.logoTemplate as any;
    if (typeof (logoTemplate as any) === "string") {
      logoTemplate = {
        type: "TextNode",
        props: {
          value: logoTemplate,
        },
      };
    }
    return (
      <AppContextAwareAppHeader
        profileMenu={renderChild(extractValue(node.props.profileMenuTemplate, true))}
        logoTitle={extractValue(node.props.logoTitle) || layoutContext?.logoTitle}
        logoContent={
          renderChild(logoTemplate, {
            type: "Stack",
            orientation: "horizontal",
          }) || layoutContext?.logoContent
        }
        style={layoutCss}
        className={layoutContext?.themeClassName}
        renderChild={renderChild}
      >
        {renderChild(node.children, {
          // Since the AppHeader is a flex container, it's children should behave the same as in a stack
          type: "Stack",
          width: "100%",
          height: "100%",
        })}
      </AppContextAwareAppHeader>
    );
  },
);
