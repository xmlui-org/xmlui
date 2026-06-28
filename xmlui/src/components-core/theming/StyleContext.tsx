import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext, useInsertionEffect, useMemo } from "react";

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

function styleObjectToCss(styles?: Record<string, CSSProperties[keyof CSSProperties]>) {
  if (!styles || Object.keys(styles).length === 0) {
    return "";
  }
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}: ${String(value)};`)
    .join(" ");
}

function hashString(value: string) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
