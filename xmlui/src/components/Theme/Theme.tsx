import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { Theme } from "./ThemeReact";
import { defaultProps } from "./Theme.defaults";

const COMP = "Theme";

export const ThemeMd = createMetadata({
  status: "stable",
  description:
    "`Theme` creates styling contexts to customize the appearance of nested " +
    "components without using CSS.",
  allowArbitraryProps: true,
  props: {
    themeId: {
      description: `This property specifies which theme to use by setting the theme's id.`,
      valueType: "string",
    },
    tone: {
      description: "This property allows the setting of the current theme's tone.",
      availableValues: ["light", "dark"],
      isStrictEnum: true,
      valueType: "string",
      defaultValue: "light",
    },
    root: {
      description: `This property indicates whether the component is at the root of the application.`,
      valueType: "boolean",
      defaultValue: defaultProps.root,
    },
    applyIf: {
      description: `This property controls whether the theme wrapper is applied. When true, the theme wraps the children. When false, children are rendered unwrapped. If not explicitly set, defaults to true only when the Theme has meaningful properties (themeId, tone, themeVars, or disableInlineStyle); otherwise defaults to false to avoid unnecessary wrapper elements.`,
      valueType: "boolean",
      defaultValue: "auto",
    },
    disableInlineStyle: {
      description: `This property controls whether inline styles are disabled for components within this theme. When undefined, uses the xmluiConfig.disableInlineStyle setting.`,
      valueType: "boolean",
    },
  },
  opaque: true,
});

export const themeComponentRenderer = wrapComponent(COMP, Theme, ThemeMd, {
  exclude: ["tone", "themeId", "root", "applyIf", "disableInlineStyle"],
  customRender(_props, { node, extractValue, renderChild, layoutContext, appContext }) {
    const { tone, ...restProps } = node.props;
    const notifications =
      appContext?.xmluiConfig?.notifications ?? appContext?.appGlobals?.notifications;
    const toastDuration = notifications?.duration;
    const notificationPosition = notifications?.position;
    let themeTone = extractValue.asOptionalString(tone);
    if (themeTone && themeTone !== "dark") {
      themeTone = "light";
    }

    const themeId = extractValue.asOptionalString(node.props.themeId);
    const isRoot = extractValue.asOptionalBoolean(node.props.root);
    const disableInlineStyle = extractValue.asOptionalBoolean(node.props.disableInlineStyle);
    const themeVars = extractValue(restProps);

    // Determine if Theme actually does anything meaningful
    // If no theme properties are set and applyIf is not explicitly set, default to false
    const hasThemeId = !!themeId;
    const hasTone = !!themeTone;
    const hasThemeVars = themeVars && Object.keys(themeVars).length > 0;
    const hasDisableInlineStyle = disableInlineStyle !== undefined;
    const hasExplicitApplyIf = node.props.applyIf !== undefined;

    const isMeaningfulTheme =
      isRoot || hasThemeId || hasTone || hasThemeVars || hasDisableInlineStyle;

    // If applyIf is explicitly set, use that value; otherwise, only apply if theme is meaningful
    const applyIf = hasExplicitApplyIf
      ? extractValue.asOptionalBoolean(node.props.applyIf)
      : isMeaningfulTheme;

    return (
      <Theme
        id={themeId}
        isRoot={isRoot}
        applyIf={applyIf}
        disableInlineStyle={disableInlineStyle}
        layoutContext={layoutContext}
        renderChild={renderChild}
        tone={themeTone as ThemeTone}
        toastDuration={toastDuration}
        notificationPosition={notificationPosition}
        themeVars={themeVars}
        node={node}
      />
    );
  },
});
