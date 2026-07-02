import { useInsertionEffect, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";

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

type DynamicStyleEntry = {
  className: string;
  hash: string;
  css: string;
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
  const entry = { className, hash, css };
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
