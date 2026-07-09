import { useInsertionEffect, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { StyleObjectType } from "./StyleRegistry";

export type StyleProviderProps = {
  children: ReactNode;
};

export function StyleProvider({ children }: StyleProviderProps) {
  return <>{children}</>;
}

export function useComponentStyle(styles?: Record<string, CSSProperties[keyof CSSProperties]>) {
  const entry = useMemo(() => {
    if (!styles || Object.keys(styles).length === 0) {
      return undefined;
    }
    return registerDynamicStyle(styles);
  }, [styles]);

  useInsertionEffect(() => {
    if (!entry || typeof document === "undefined") {
      return;
    }
    if (document.head.querySelector(`style[data-xmlui-style-hash="${entry.hash}"]`)) {
      return;
    }
    const style = document.createElement("style");
    style.setAttribute("data-xmlui-style-hash", entry.hash);
    style.textContent = `@layer dynamic {${entry.css}}`;
    document.head.appendChild(style);
  }, [entry]);

  return entry?.className;
}

export function useStyles(styles?: StyleObjectType, options: { layer?: string } = {}) {
  const layer = options.layer ?? "dynamic";
  const entry = useMemo(() => {
    if (!styles || Object.keys(styles).length === 0) {
      return undefined;
    }
    return registerDynamicStyleObject(styles, layer);
  }, [layer, styles]);

  useInsertionEffect(() => {
    if (!entry || typeof document === "undefined") {
      return;
    }
    if (document.head.querySelector(`style[data-xmlui-style-hash="${entry.hash}"]`)) {
      return;
    }
    const style = document.createElement("style");
    style.setAttribute("data-xmlui-style-hash", entry.hash);
    style.textContent = `@layer ${entry.layer} {${entry.css}}`;
    document.head.appendChild(style);
  }, [entry]);

  return entry?.className;
}

const rootStyleRegistry = {
  addRootClasses: (_classNames: Array<string | undefined>) => undefined,
};

export function useStyleRegistry() {
  return rootStyleRegistry;
}

export function useDomRoot(): Document | ShadowRoot | undefined {
  return typeof document === "undefined" ? undefined : document;
}

type DynamicStyleEntry = {
  className: string;
  hash: string;
  css: string;
  layer: string;
};

const dynamicStyleCache = new Map<string, DynamicStyleEntry>();

function registerDynamicStyle(styles: Record<string, CSSProperties[keyof CSSProperties]>): DynamicStyleEntry | undefined {
  const key = stableJSONStringify(styles);
  const hash = hashString(key);
  const cached = dynamicStyleCache.get(hash);
  if (cached) {
    return cached;
  }
  const className = `xmlui-css-${hash}`;
  const css = generateCss(`.${className}`, styles);
  if (!css) {
    return undefined;
  }
  const entry = { className, hash, css, layer: "dynamic" };
  dynamicStyleCache.set(hash, entry);
  return entry;
}

function registerDynamicStyleObject(styles: StyleObjectType, layer: string): DynamicStyleEntry | undefined {
  const key = stableJSONStringify({ layer, styles });
  const hash = hashString(key);
  const cached = dynamicStyleCache.get(hash);
  if (cached) {
    return cached;
  }
  const className = `xmlui-css-${hash}`;
  const css = generateNestedCss(`.${className}`, styles);
  if (!css) {
    return undefined;
  }
  const entry = { className, hash, css, layer };
  dynamicStyleCache.set(hash, entry);
  return entry;
}

function generateCss(selector: string, styles: Record<string, CSSProperties[keyof CSSProperties]>): string {
  const declarations = Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([name, value]) => `${toKebabCase(name)}:${String(value)};`)
    .join("");
  return declarations ? `${selector}{${declarations}}` : "";
}

function generateNestedCss(selector: string, styles: StyleObjectType): string {
  let declarations = "";
  let nested = "";
  for (const [name, value] of Object.entries(styles)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    if (typeof value === "object") {
      if (name.startsWith("@media")) {
        nested += `${name}{${generateNestedCss(selector, value as StyleObjectType)}}`;
      } else {
        const nestedSelector = name.includes("&") ? name.replaceAll("&", selector) : `${selector} ${name}`;
        nested += generateNestedCss(nestedSelector, value as StyleObjectType);
      }
      continue;
    }
    declarations += `${toKebabCase(name)}:${String(value)};`;
  }
  return `${declarations ? `${selector}{${declarations}}` : ""}${nested}`;
}

function toKebabCase(value: string): string {
  return value.startsWith("--")
    ? value
    : value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function stableJSONStringify(value: unknown): string {
  if (!value || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableJSONStringify).join(",")}]`;
  }
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJSONStringify((value as Record<string, unknown>)[key])}`)
    .join(",")}}`;
}

function hashString(value: string): string {
  let hash = 5381;
  let index = value.length;
  while (index) {
    hash = (hash * 33) ^ value.charCodeAt(--index);
  }
  return (hash >>> 0).toString(36);
}
