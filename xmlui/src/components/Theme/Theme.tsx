import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { Theme } from "./ThemeReact";
import { defaultProps } from "./Theme.defaults";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { useAppContext } from "../../components-core/AppContext";
import { useThemes } from "../../components-core/theming/ThemeContext";
import { useBooleanProp, useEvaluatedProp, useStringProp, useThemeOverrideProps } from "../../runtime/rendering/props";
import type { RuntimeRenderLayoutContext, XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { isLayoutPropName, looksLikeComponentThemeVariableName } from "../../styling";

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
    const { tone, themeId: _themeId, root: _root, applyIf: _applyIf, disableInlineStyle: _disableInlineStyle, ...restProps } = node.props;
    const notifications =
      appContext?.xmluiConfig?.notifications ?? appContext?.appGlobals?.notifications;
    const toastDuration = notifications?.duration;
    const notificationPosition = notifications?.position;
    let themeTone = extractValue.asOptionalString(tone);
    if (themeTone && themeTone !== "dark") {
      themeTone = "light";
    }

    const themeId = extractValue.asOptionalString(node.props.themeId);
    const isRoot = optionalBooleanProp(node.props.root);
    const disableInlineStyle = optionalBooleanProp(node.props.disableInlineStyle);
    const themeVars = extractValue(restProps);

    // Determine if Theme actually does anything meaningful
    // If no theme properties are set and applyIf is not explicitly set, default to false
    const hasThemeId = !!themeId;
    const hasTone = !!themeTone;
    const hasThemeVars = hasThemeVariableProps(restProps);
    const hasDisableInlineStyle = disableInlineStyle !== undefined;
    const hasExplicitApplyIf = node.props.applyIf !== undefined;

    const isMeaningfulTheme =
      isRoot || hasThemeId || hasTone || hasThemeVars || hasDisableInlineStyle;

    // If applyIf is explicitly set, use that value; otherwise, only apply if theme is meaningful
    const applyIf = hasExplicitApplyIf
      ? optionalBooleanProp(node.props.applyIf) ?? defaultProps.applyIf
      : isMeaningfulTheme;

    if (!applyIf) {
      return <>{renderChild(node.children, layoutContext)}</>;
    }

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

export const themeRenderer: XmluiBuiltInRenderer = ({ context, node, scope, layoutContext }) => {
  const appContext = useAppContext();
  const appThemes = useThemes();
  const toneProp = useStringProp(node, scope, "tone", "");
  const tone = toneProp === "dark" ? "dark" : toneProp === "light" ? "light" : undefined;
  const themeTone = tone ?? appThemes.activeThemeTone;
  const themeId = useEvaluatedProp(node, scope, "themeId", undefined);
  const root = useBooleanProp(node, scope, "root", false);
  const disableInlineStyle = useBooleanProp(node, scope, "disableInlineStyle", undefined);
  const themeVariables = themeVariablesOnly(useThemeOverrideProps(node, scope));
  const authoredProps = node.props;
  const hasExplicitApplyIf = Object.prototype.hasOwnProperty.call(authoredProps, "applyIf");
  const hasDisableInlineStyle = Object.prototype.hasOwnProperty.call(authoredProps, "disableInlineStyle");
  const hasThemeVars = hasThemeVariableProps(authoredProps);
  const applyIf = hasExplicitApplyIf
    ? useBooleanProp(node, scope, "applyIf", defaultProps.applyIf)
    : root || !!themeId || !!tone || hasThemeVars || hasDisableInlineStyle;
  const shouldApplyTheme = applyIf ?? defaultProps.applyIf;
  const notifications =
    appContext?.xmluiConfig?.notifications ?? appContext?.appGlobals?.notifications;
  if (!shouldApplyTheme) {
    return renderThemeChildren(
      context,
      scope,
      node.children,
      layoutContext as LayoutContext | undefined,
    );
  }

  const themedElement = (
    <Theme
      id={typeof themeId === "string" ? themeId : undefined}
      isRoot={root}
      applyIf={applyIf}
      disableInlineStyle={disableInlineStyle}
      layoutContext={layoutContext as LayoutContext | undefined}
      renderChild={(children, childLayoutContext) =>
        renderThemeChildren(context, scope, children, childLayoutContext)
      }
      tone={tone as ThemeTone | undefined}
      toastDuration={typeof notifications?.duration === "number" ? notifications.duration : undefined}
      notificationPosition={notifications?.position}
      themeVars={themeVariables as Record<string, string>}
      node={node as unknown as ComponentDef}
    />
  );
  return themedElement;
};

function themeVariablesOnly(props: Record<string, unknown>): Record<string, unknown> {
  const {
    themeId: _themeId,
    tone: _tone,
    root: _root,
    applyIf: _applyIf,
    disableInlineStyle: _disableInlineStyle,
    ...rest
  } = props;
  return rest;
}

function renderThemeChildren(
  context: Parameters<XmluiBuiltInRenderer>[0]["context"],
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  children: unknown,
  layoutContext?: LayoutContext,
) {
  if (children === undefined || children === null) {
    return null;
  }
  if (typeof children === "string") {
    return children;
  }
  return context.renderChildren(
    Array.isArray(children) ? children as any : [children] as any,
    scope,
    undefined,
    layoutContext as RuntimeRenderLayoutContext | undefined,
  );
}

function optionalBooleanProp(value: unknown): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false" || normalized === "") {
      return false;
    }
  }
  return Boolean(value);
}

function hasThemeVariableProps(props: Record<string, unknown>): boolean {
  return Object.keys(themeVariablesOnly(props)).some((name) => {
    if (
      name === "name" ||
      name === "id" ||
      name === "testId" ||
      name === "className" ||
      name === "classes" ||
      name === "style" ||
      name.startsWith("__xmlui") ||
      name.startsWith("data-")
    ) {
      return false;
    }
    if (isLayoutPropName(name) && name !== "fontSize" && !looksLikeComponentThemeVariableName(name)) {
      return false;
    }
    return true;
  });
}
