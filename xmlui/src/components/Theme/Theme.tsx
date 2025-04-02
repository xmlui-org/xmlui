import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { ThemeTone } from "../../abstractions/ThemingDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { Theme } from "./ThemeNative";

const COMP = "Theme";

export const ThemeMd = createMetadata({
  description:
    `The \`${COMP}\` component provides a way to define a particular theming context for ` +
    `its nested components. The XMLUI framework uses \`${COMP}\` to define the default ` +
    `theming context for all of its child components. Theme variables and theme settings ` +
    `only work in this context.`,
  allowArbitraryProps: true,
  props: {
    themeId: d(`This property specifies which theme to use by setting the theme's id.`),
    tone: {
      description: "This property allows the setting of the current theme's tone.",
      availableValues: ["light", "dark"],
      valueType: "string",
      defaultValue: "light",
    },
    root: d(`This property indicates whether the component is at the root of the application.`),
  },
  opaque: true,
});

export const themeComponentRenderer = createComponentRenderer(
  COMP,
  ThemeMd,
  ({ node, extractValue, renderChild, layoutContext, appContext }) => {
    const { tone, ...restProps } = node.props;
    const toastDuration = appContext?.appGlobals?.notifications?.duration;
    let themeTone = extractValue.asOptionalString(tone);
    if (themeTone && themeTone !== "dark") {
      themeTone = "light";
    }
    return (
      <Theme
        id={extractValue.asOptionalString(node.props.themeId)}
        isRoot={extractValue.asOptionalBoolean(node.props.root)}
        layoutContext={layoutContext}
        renderChild={renderChild}
        tone={themeTone as ThemeTone}
        toastDuration={toastDuration}
        themeVars={extractValue(restProps)}
        node={node}
      />
    );
  },
);
