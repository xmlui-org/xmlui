import { createComponentRenderer } from "@components-core/renderers";
import { useId, useMemo, useState } from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import styles from "./Theme.module.scss";
import { useCompiledTheme } from "@components-core/theming/ThemeProvider";
import { ThemeContext, useTheme, useThemes } from "@components-core/theming/ThemeContext";
import classnames from "@components-core/utils/classnames";
import { Helmet } from "react-helmet-async";
import { createPortal } from "react-dom";
import type { ThemeDefinition, ThemeScope, ThemeTone } from "@components-core/theming/abstractions";
import type { LayoutContext } from "@abstractions/RendererDefs";
import { EMPTY_OBJECT } from "@components-core/constants";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { ErrorBoundary } from "@components-core/ErrorBoundary";
import { NotificationToast } from "./NotificationToast";
import type { RenderChildFn } from "@abstractions/RendererDefs";

function getClassName(css: string) {
  return `theme-${calculateHash(css)}`;
}

function calculateHash(str: string) {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

type ThemeProps = {
  id?: string;
  isRoot?: boolean;
  layoutContext?: LayoutContext;
  renderChild: RenderChildFn;
  node: ComponentDef;
  tone?: ThemeTone;
  toastDuration?: number;
  themeVars?: Record<string, string>;
};

export function Theme({
  id,
  isRoot = false,
  renderChild,
  node,
  tone,
  toastDuration = 5000,
  themeVars = EMPTY_OBJECT,
  layoutContext,
}: ThemeProps) {
  const generatedId = useId();

  const { themes, resources, resourceMap, activeThemeId, setRoot, root } = useThemes();
  const { activeTheme, activeThemeTone } = useTheme();
  const themeTone = tone || activeThemeTone;
  const currentTheme: ThemeDefinition = useMemo(() => {
    const themeToExtend = id ? themes.find((theme) => theme.id === id)! : activeTheme;
    if (!themeToExtend) {
      throw new Error("Theme not found");
    }
    const foundTheme = {
      ...themeToExtend,
      id: generatedId,
      tones: {
        ...themeToExtend.tones,
        [themeTone]: {
          ...themeToExtend.tones?.[themeTone],
          themeVars: {
            ...themeToExtend.tones?.[themeTone]?.themeVars,
            ...themeVars,
          },
        },
      },
    };
    return foundTheme;
  }, [activeTheme, generatedId, id, themeTone, themeVars, themes]);

  const { themeCssVars, getResourceUrl, fontLinks, allThemeVarsWithResolvedHierarchicalVars, getThemeVar } =
    useCompiledTheme(currentTheme, themeTone, themes, resources, resourceMap);

  const { css, className, rangeClassName, fromClass, toClass } = useMemo(() => {
    const vars = { ...themeCssVars, "color-scheme": themeTone };
    // const vars = themeCssVars;
    const css = Object.entries(vars)
      .map(([key, value]) => {
        return key + ":" + value + ";";
      })
      .join(" ");
    const className = getClassName(css);
    const fromClass = `${className}-from`;
    const toClass = `${className}-to`;
    let rangeClassName;
    if (!isRoot) {
      rangeClassName = `${fromClass} ~ *:has(~ .${toClass})`;
    }
    return {
      className,
      rangeClassName,
      fromClass,
      toClass,
      css,
    };
  }, [getThemeVar, isRoot, themeCssVars, themeTone]);

  // useInsertionEffect(() => {
  //   //PERF OPT IDEA: don't inject the css content that we already have
  //   // (e.g. in Items component we inject and generate classes for all items if we use a theme for an item, but they have the same content.
  //   // We could inject one class, and use that instead. The harder part is keeping track of them, and remove when nobody uses them)
  //   injectCSS(`.${className} {${css}}`, className);
  //   if (rangeClassName) {
  //     injectCSS(`.${rangeClassName} {${css}}`, rangeClassName);
  //   }
  //   let injectedClassNames = [className, rangeClassName];
  //   return () => {
  //     injectedClassNames.forEach(injectedClassName => {
  //       if (injectedClassName) {
  //         cleanupCss(injectedClassName);
  //       }
  //     });
  //   };
  // }, [className, css]);

  const [themeRoot, setThemeRoot] = useState(root);

  const currentThemeContextValue = useMemo(() => {
    const themeVal: ThemeScope = {
      root: themeRoot,
      activeThemeId,
      activeThemeTone: themeTone,
      activeTheme: currentTheme,
      themeStyles: themeCssVars,
      themeVars: allThemeVarsWithResolvedHierarchicalVars,
      getResourceUrl,
      getThemeVar,
    };
    return themeVal;
  }, [
    themeRoot,
    activeThemeId,
    themeTone,
    currentTheme,
    themeCssVars,
    allThemeVarsWithResolvedHierarchicalVars,
    getResourceUrl,
    getThemeVar,
  ]);

  if (isRoot) {
    const faviconUrl = getResourceUrl("resource:favicon");
    return (
      <>
        <Helmet>
          {!!faviconUrl && <link rel="icon" type="image/svg+xml" href={faviconUrl} />}
          {fontLinks?.map((fontLink) => (
            <link href={fontLink} rel={"stylesheet"} key={fontLink} />
          ))}
        </Helmet>
        <style>{`.${className} {${css}}`}</style>
        <div
          id={"_ui-engine-theme-root"}
          className={classnames(styles.baseRootComponent, className)}
          ref={(el) => {
            if (el) {
              setRoot(el);
            }
          }}
        >
          <ErrorBoundary node={node} location={"theme-root"}>
            {renderChild(node.children)}
          </ErrorBoundary>
          <NotificationToast toastDuration={toastDuration} />
        </div>
      </>
    );
  }
  return (
    <ThemeContext.Provider value={currentThemeContextValue}>
      <style>{`.${rangeClassName} {${css}}`}</style>
      <style>{`.${className} {${css}}`}</style>
      <div className={classnames(styles.from, fromClass)} />
      {renderChild(node.children, { ...layoutContext, themeClassName: className })}
      <div className={classnames(styles.to, toClass)} />
      {root &&
        createPortal(
          <div
            className={classnames(className)}
            ref={(el) => {
              if (el) {
                setThemeRoot(el);
              }
            }}
          ></div>,
          root
        )}
    </ThemeContext.Provider>
  );
}

/**
 * The \`Theme\` component provides a way to define a particular theming context for its nested components.
 * The XMLUI framework uses \`Theme\` to define the default theming context for all of its child components.
 * Theme variables and theme settings only work in this context.
 * @descriptionRef
 */
export interface ThemeComponentDef extends ComponentDef<"Theme"> {
  props: {
    /**
     * This property specifies which theme to use by setting the theme's id.
     * @descriptionRef
     */
    themeId?: string;
    /**
     * This property allows the setting of the current theme's tone.
     * Tone is either \`light\` or \`dark\`.
     *
     * The default tone is \`light\`.
     * @descriptionRef
     */
    tone?: string;
    /**
     * This property indicates whether the component is at the root of the application.
     * @descriptionRef
     */
    root?: boolean;
  };
}

export const ThemeMd: ComponentDescriptor<ThemeComponentDef> = {
  displayName: "Theme",
  description: "This component allows defining a particular theming context for its nested components",
  allowArbitraryProps: true,
  props: {
    themeId: desc("The id of the theme to use"),
    tone: desc("The tone to use in the theming context"),
  },
  opaque: true,
};

export const themeComponentRenderer = createComponentRenderer<ThemeComponentDef>(
  "Theme",
  ({ node, extractValue, renderChild, layoutContext, appContext }) => {
    const { tone, ...restProps } = node.props;
    const toastDuration = appContext?.globals?.notifications?.duration;
    return (
      <Theme
        id={extractValue.asOptionalString(node.props.themeId)}
        isRoot={extractValue.asOptionalBoolean(node.props.root)}
        layoutContext={layoutContext}
        renderChild={renderChild}
        tone={extractValue.asOptionalString(tone) as ThemeTone}
        toastDuration={toastDuration}
        themeVars={extractValue(restProps)}
        node={node}
      />
    );
  },
  ThemeMd
);
