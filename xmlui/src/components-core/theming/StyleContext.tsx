import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext, useInsertionEffect, useMemo } from "react";
import type { StyleObjectType } from "./StyleRegistry";

type StyleProviderProps = {
  children: ReactNode;
};

const StyleInjectionTargetContext = createContext<Document | ShadowRoot | null>(null);

export function StyleProvider({ children }: StyleProviderProps) {
  return <>{children}</>;
}

export function useDomRoot() {
  return useContext(StyleInjectionTargetContext);
}

export function useComponentStyle(styles?: Record<string, CSSProperties[keyof CSSProperties]>) {
  const cssText = useMemo(() => styleObjectToCss(styles), [styles]);
  const className = useMemo(() => {
    if (!cssText) {
      return undefined;
    }
    return `xmlui-dynamic-${hashString(cssText)}`;
  }, [cssText]);

  const domRoot = useDomRoot();
  useInsertionEffect(() => {
    if (!className || !cssText || typeof document === "undefined") {
      return;
    }
    const injectionTarget = domRoot instanceof ShadowRoot ? domRoot : document.head;
    if (injectionTarget.querySelector(`style[data-xmlui-dynamic-style="${className}"]`)) {
      return;
    }
    const styleElement = document.createElement("style");
    styleElement.setAttribute("data-xmlui-dynamic-style", className);
    styleElement.innerHTML = `@layer dynamic { .${className} { ${cssText} } }`;
    injectionTarget.appendChild(styleElement);
  }, [className, cssText, domRoot]);

  return className;
}

export function useStyles(styles?: StyleObjectType) {
  const cssText = useMemo(() => styleObjectToNestedCss(styles), [styles]);
  const className = useMemo(() => {
    if (!cssText) {
      return undefined;
    }
    return `xmlui-dynamic-${hashString(cssText)}`;
  }, [cssText]);

  const domRoot = useDomRoot();
  useInsertionEffect(() => {
    if (!className || !cssText || typeof document === "undefined") {
      return;
    }
    const injectionTarget = domRoot instanceof ShadowRoot ? domRoot : document.head;
    if (injectionTarget.querySelector(`style[data-xmlui-dynamic-style="${className}"]`)) {
      return;
    }
    const styleElement = document.createElement("style");
    styleElement.setAttribute("data-xmlui-dynamic-style", className);
    styleElement.innerHTML = `@layer dynamic { ${cssText.replaceAll("&", `.${className}`)} }`;
    injectionTarget.appendChild(styleElement);
  }, [className, cssText, domRoot]);

  return className;
}

function styleObjectToCss(styles?: Record<string, CSSProperties[keyof CSSProperties]>) {
  if (!styles || Object.keys(styles).length === 0) {
    return "";
  }
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}: ${String(value)};`)
    .join(" ");
}

function styleObjectToNestedCss(styles?: StyleObjectType) {
  if (!styles || Object.keys(styles).length === 0) {
    return "";
  }
  return Object.entries(styles)
    .map(([selector, value]) => {
      if (!isStyleObject(value)) {
        return "";
      }
      if (selector.startsWith("@media")) {
        const body = Object.entries(value)
          .map(([nestedSelector, nestedValue]) => {
            if (!isStyleObject(nestedValue)) {
              return "";
            }
            const nestedCss = styleObjectToCssDeclarations(nestedValue);
            return nestedCss ? `${nestedSelector} { ${nestedCss} }` : "";
          })
          .filter(Boolean)
          .join(" ");
        return body ? `${selector} { ${body} }` : "";
      }
      const css = styleObjectToCssDeclarations(value);
      return css ? `${selector} { ${css} }` : "";
    })
    .filter(Boolean)
    .join(" ");
}

function styleObjectToCssDeclarations(styles: StyleObjectType) {
  return Object.entries(styles)
    .filter(([, value]) => !isStyleObject(value) && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}: ${String(value)};`)
    .join(" ");
}

function isStyleObject(value: unknown): value is StyleObjectType {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hashString(value: string) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
