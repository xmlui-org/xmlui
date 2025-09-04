// app/utils/styleUtils.ts

import type { CSSProperties } from 'react';

// --- Type Definitions ---

// This type definition is now more powerful. It allows a value to be another
// style object, enabling true nesting.
export type StyleObjectType =
  CSSProperties & {
  [selectorOrAtRule: string]: StyleObjectType | CSSProperties[keyof CSSProperties];
};

interface StyleCacheEntry {
  className: string;
  styleHash: string;
  css: string;
}

// --- Helper Functions ---

function hashString(str: string): string {
  let hash = 5381;
  let i = str.length;
  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  let s = (hash >>> 0).toString(36);
  // console.log("hashString", str, "->", s);
  return s;
}

/**
 * Converts a camelCase string to kebab-case, but ignores CSS Custom Properties.
 * @param {string} str The string to convert.
 * @returns {string} The formatted string.
 */
function toKebabCase(str: string): string {
  // NEW: If the string is a CSS Custom Property (starts with '--'),
  // return it as-is without any changes.
  if (str.startsWith('--')) {
    return str;
  }
  // Otherwise, convert from camelCase to kebab-case as before.
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}


/**
 * Creates a stable, canonical JSON string from an object by sorting keys recursively.
 * This ensures that objects with the same content produce the same string regardless of key order.
 * @param obj The object to stringify.
 * @returns A stable string representation.
 */
function stableJSONStringify(obj: any): string {
  return JSON.stringify(obj);
  // if (obj === null || typeof obj !== 'object') {
  //   return JSON.stringify(obj);
  // }
  //
  // if (Array.isArray(obj)) {
  //   const arrayStr = obj.map(item => stableJSONStringify(item)).join(',');
  //   return `[${arrayStr}]`;
  // }
  //
  // const keys = Object.keys(obj).sort();
  // const props = keys.map(key => {
  //   const value = stableJSONStringify(obj[key]);
  //   return `"${key}":${value}`;
  // });
  //
  // return `{${props.join(',')}}`;
}

// --- The StyleRegistry Class (with updated logic) ---

export class StyleRegistry {
  public cache: Map<string, StyleCacheEntry> = new Map();
  public rootClasses: Set<string> = new Set();
  public injected: Set<string> = new Set();

  // NEW: A map to track how many components are using a style.
  public refCounts: Map<string, number> = new Map();

  // NEW: A set to specifically track hashes injected by SSR.
  public ssrHashes: Set<string> = new Set();

  public register(styles: StyleObjectType): StyleCacheEntry {
    const key = stableJSONStringify(styles);
    const styleHash = hashString(key);

    const cachedEntry = this.cache.get(styleHash);
    if (cachedEntry) {
      return cachedEntry;
    }

    // The entry point for our new recursive generator.
    const className = `css-${styleHash}`;
    const css = this._generateCss(`.${className}`, styles);

    const entry: StyleCacheEntry = { className, styleHash, css };
    this.cache.set(styleHash, entry);
    return entry;
  }

  /**
   * [PRIVATE] Recursively generates CSS rules from a style object.
   * This is the new, more powerful engine.
   * @param selector - The CSS selector for the current context (e.g., '.css-123' or '&:hover').
   * @param styles - The style object to process.
   * @returns A string of CSS rules.
   */
  private _generateCss(selector: string, styles: StyleObjectType): string {
    const directProps: string[] = [];
    const nestedRules: string[] = [];

    // 1. Separate direct CSS properties from nested rules.
    for (const key in styles) {
      const value = styles[key];
      if (typeof value === 'object' && value !== null) {
        // It's a nested rule (e.g., '&:hover', '@media').
        nestedRules.push(this._processNestedRule(selector, key, value as StyleObjectType));
      } else {
        // It's a direct CSS property (e.g., 'backgroundColor').
        directProps.push(`${toKebabCase(key)}:${value};`);
      }
    }

    let finalCss = '';

    // 2. Generate the CSS for the direct properties at the current selector level.
    if (directProps.length > 0) {
      finalCss += `\n${selector} {${directProps.join('')}}`;
    }

    // 3. Append the CSS from all the processed nested rules.
    finalCss += nestedRules.join('');

    return finalCss;
  }

  private _processNestedRule(parentSelector: string, nestedKey: string, nestedStyles: StyleObjectType): string {
    // If the key is an at-rule (@media, @container, @keyframes), wrap the recursive call.
    if (nestedKey.startsWith('@')) {
      // The inner content is generated relative to the original parent selector.
      return `\n${nestedKey}{${this._generateCss(parentSelector, nestedStyles)}}`;
    }

    // If the key is a nested selector, resolve the '&' placeholder.
    // e.g., parent='.css-123', nestedKey='&:hover' -> '.css-123:hover'
    const newSelector = nestedKey.replace(/&/g, parentSelector);
    return this._generateCss(newSelector, nestedStyles);
  }

  public getSsrStyles(): string {
    const allCss = Array.from(this.cache.values()).map(entry => entry.css).join('');
    // Wrap the entire output in our top-most layer.
    return `@layer dynamic {${allCss}}`;
  }

  /**
   * Adds a class name to be applied to the <html> tag.
   */
  public addRootClasses(classNames: Array<string>): void {
    classNames.forEach((className)=>{
      this.rootClasses.add(className);
    });
  }

  /**
   * Returns a space-separated string of all collected html classes.
   */
  public getRootClasses(): string {
    return Array.from(this.rootClasses).join(' ');
  }



  // NEW: A helper to safely get the current reference count.
  public getRefCount(styleHash: string): number {
    return this.refCounts.get(styleHash) || 0;
  }


  /**
   * Increments the reference count for a given style hash.
   */
  public incrementRef(styleHash: string): void {
    const newCount = (this.refCounts.get(styleHash) || 0) + 1;
    this.refCounts.set(styleHash, newCount);
    // console.log("incrementing ref count for styleHash:", styleHash, "to", newCount);
  }

  /**
   * Decrements the reference count for a given style hash.
   * @returns {number} The new reference count.
   */
  public decrementRef(styleHash: string): number {
    const currentCount = this.refCounts.get(styleHash) || 0;
    const newCount = Math.max(0, currentCount - 1);
    // console.log("decrementing ref count for styleHash:", styleHash, "from", currentCount, "to", newCount);

    if (newCount > 0) {
      this.refCounts.set(styleHash, newCount);
    } else {
      // If the count is zero, remove it from the map.
      this.refCounts.delete(styleHash);
    }

    return newCount;
  }
}