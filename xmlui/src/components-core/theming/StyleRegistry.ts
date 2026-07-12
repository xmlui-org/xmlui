import type { CSSProperties } from "react";

export type StyleObjectType = CSSProperties & {
  [selectorOrAtRule: string]: StyleObjectType | CSSProperties[keyof CSSProperties] | undefined;
};

export interface StyleCacheEntry {
  className: string;
  styleHash: string;
  css: string;
  layer: string;
}

const orderedLayers = ["reset", "base", "components", "themes", "dynamic"];

export class StyleRegistry {
  public cache: Map<string, StyleCacheEntry> = new Map();
  public rootClasses: Set<string> = new Set();
  public injected: Set<string> = new Set();
  public refCounts: Map<string, number> = new Map();
  public ssrHashes: Set<string> = new Set();

  public register(styles: StyleObjectType, layer = "dynamic"): StyleCacheEntry {
    const key = stableJSONStringify({ layer, styles });
    const styleHash = hashString(key);
    const cachedEntry = this.cache.get(styleHash);
    if (cachedEntry) {
      return cachedEntry;
    }

    const className = `css-${styleHash}`;
    const css = this.generateCss(`.${className}`, styles);
    const entry: StyleCacheEntry = { className, styleHash, css, layer };
    this.cache.set(styleHash, entry);
    return entry;
  }

  public getSsrStyles(): string {
    const cssByLayer = new Map<string, string>();

    Array.from(this.cache.values())
      .reverse()
      .forEach((entry) => {
        const current = cssByLayer.get(entry.layer) || "";
        cssByLayer.set(entry.layer, `${current}${entry.css}`);
      });

    const extraLayers = Array.from(cssByLayer.keys()).filter((layer) => !orderedLayers.includes(layer));
    const allLayers = [...orderedLayers, ...extraLayers];
    const layerDeclarations = allLayers.join(", ");
    const layeredCss = allLayers
      .map((layer) => {
        const css = cssByLayer.get(layer);
        return css ? `@layer ${layer} {${css}}` : "";
      })
      .join("");

    return `@layer ${layerDeclarations};${layeredCss}`;
  }

  public addRootClasses(classNames: Array<string | undefined>): void {
    classNames.forEach((className) => {
      if (className) {
        this.rootClasses.add(className);
      }
    });
  }

  public getRootClasses(): string {
    return Array.from(this.rootClasses).join(" ");
  }

  public getRootClassNames(): string {
    return this.getRootClasses();
  }

  public getRefCount(styleHash: string): number {
    return this.refCounts.get(styleHash) || 0;
  }

  public incrementRef(styleHash: string): void {
    this.refCounts.set(styleHash, (this.refCounts.get(styleHash) || 0) + 1);
  }

  public decrementRef(styleHash: string): number {
    const newCount = Math.max(0, (this.refCounts.get(styleHash) || 0) - 1);
    if (newCount > 0) {
      this.refCounts.set(styleHash, newCount);
    } else {
      this.refCounts.delete(styleHash);
    }
    return newCount;
  }

  private generateCss(selector: string, styles: StyleObjectType, seen = new WeakSet<object>()): string {
    const directProps: string[] = [];
    const nestedRules: string[] = [];

    for (const key in styles) {
      const value = styles[key];
      if (value !== null && typeof value === "object") {
        const proto = Object.getPrototypeOf(value);
        const isPlain = proto === Object.prototype || proto === null;
        if (!isPlain || seen.has(value)) {
          continue;
        }
        seen.add(value);
        nestedRules.push(this.processNestedRule(selector, key, value as StyleObjectType, seen));
        continue;
      }

      if (value !== undefined && value !== "") {
        directProps.push(`${toKebabCase(key)}:${String(value)};`);
      }
    }

    let finalCss = "";
    if (directProps.length > 0) {
      finalCss += `${selector} {${directProps.join("")}}`;
    }
    finalCss += nestedRules.join("");
    return finalCss;
  }

  private processNestedRule(
    parentSelector: string,
    nestedKey: string,
    nestedStyles: StyleObjectType,
    seen: WeakSet<object>,
  ): string {
    if (nestedKey.startsWith("@")) {
      return `${nestedKey}{${this.generateCss(parentSelector, nestedStyles, seen)}}`;
    }

    const newSelector = nestedKey.replace(/&/g, parentSelector);
    return this.generateCss(newSelector, nestedStyles, seen);
  }
}

function hashString(str: string): string {
  let hash = 5381;
  let i = str.length;
  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return (hash >>> 0).toString(36);
}

function toKebabCase(str: string): string {
  if (str.startsWith("--")) {
    return str;
  }
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function stableJSONStringify(obj: unknown, seen = new WeakSet<object>()): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (seen.has(obj)) {
    return "\"[Circular]\"";
  }

  const proto = Object.getPrototypeOf(obj);
  if (proto !== Object.prototype && proto !== null && !Array.isArray(obj)) {
    return `"[Object ${(obj as { constructor?: { name?: string } }).constructor?.name ?? "Unknown"}]"`;
  }

  seen.add(obj);

  if (Array.isArray(obj)) {
    return `[${obj.map((item) => stableJSONStringify(item, seen)).join(",")}]`;
  }

  const keys = Object.keys(obj).sort();
  const props = keys.map((key) => {
    const value = stableJSONStringify((obj as Record<string, unknown>)[key], seen);
    return `${JSON.stringify(key)}:${value}`;
  });

  return `{${props.join(",")}}`;
}
