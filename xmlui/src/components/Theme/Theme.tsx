import { ThemeTone } from "../../abstractions/ThemingDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d } from "../metadata-helpers";
import { Theme, defaultProps } from "./ThemeNative";

const COMP = "Theme";

export const ThemeMd = createMetadata({
  status: "stable",
  description:
    "`Theme` creates styling contexts to customize the appearance of nested " +
    "components without using CSS.",
  allowArbitraryProps: true,
  props: {
    themeId: d(`This property specifies which theme to use by setting the theme's id.`),
    tone: {
      description: "This property allows the setting of the current theme's tone.",
      availableValues: ["light", "dark"],
      valueType: "string",
      defaultValue: "light",
    },
    root: d(
      `This property indicates whether the component is at the root of the application.`,
      undefined,
      "boolean",
      defaultProps.root,
    ),
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
