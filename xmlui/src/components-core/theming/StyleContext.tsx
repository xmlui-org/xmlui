import type React from "react";
import { createContext, useContext, useEffect, useInsertionEffect, useMemo, useState } from "react";
import type { StyleObjectType } from "./StyleRegistry";
import { StyleRegistry } from "./StyleRegistry";
import { EMPTY_OBJECT } from "../constants";
import { useIndexerContext } from "../../components/App/IndexerContext";

export type StyleProviderProps = {
  children: React.ReactNode;
  styleRegistry?: StyleRegistry;
  forceNew?: boolean;
};

const StyleContext = createContext<StyleRegistry | null>(null);

export function StyleProvider({
  children,
  styleRegistry = new StyleRegistry(),
  forceNew = false,
}: StyleProviderProps) {
  const parentRegistry = useContext(StyleContext);
  const [registry] = useState(() => {
    const newRegistry = styleRegistry;
    if (typeof window !== "undefined") {
      const ssrTag = document.querySelector('style[data-style-registry="true"]');
      const ssrHashes = ssrTag?.getAttribute("data-ssr-hashes");
      if (ssrHashes) {
        const hashes = ssrHashes.split(",");
        newRegistry.ssrHashes = new Set(hashes);
        newRegistry.injected = new Set(hashes);
      }
    }
    return newRegistry;
  });

  if (parentRegistry && !forceNew) {
    return <>{children}</>;
  }

  return <StyleContext.Provider value={registry}>{children}</StyleContext.Provider>;
}

export function useComponentStyle(styles?: StyleObjectType) {
  const rootStyle = useMemo(() => {
    return !styles || Object.keys(styles).length === 0
      ? EMPTY_OBJECT
      : {
          "&": styles,
        };
  }, [styles]);

  return useStyles(rootStyle);
}

export function useStyleRegistry(): StyleRegistry {
  const registry = useContext(StyleContext);
  if (registry === null) {
    throw new Error("Component must be used within a StyleProvider");
  }
  return registry;
}

export const StyleInjectionTargetContext = createContext<Document | ShadowRoot | null>(null);

export function useDomRoot() {
  return useContext(StyleInjectionTargetContext);
}

type InjectOptions = {
  prepend?: boolean;
  layer?: string;
};

export function useStyles(
  styles: StyleObjectType,
  { prepend, layer = "dynamic" }: InjectOptions = EMPTY_OBJECT,
): string | undefined {
  const { indexing } = useIndexerContext();
  const domRoot = useDomRoot();
  const injectionTarget =
    typeof document === "undefined"
      ? null
      : domRoot instanceof ShadowRoot
        ? domRoot
        : document.head;
  const registry = useStyleRegistry();
  const { className, styleHash } = useMemo(() => {
    if (indexing || !styles || styles === EMPTY_OBJECT || Object.keys(styles).length === 0) {
      return { className: undefined, styleHash: undefined };
    }
    return registry.register(styles, layer);
  }, [indexing, layer, registry, styles]);

  useInsertionEffect(() => {
    if (!styleHash || !injectionTarget || typeof document === "undefined") {
      return;
    }

    if (registry.injected.has(styleHash)) {
      const existingElement = injectionTarget.querySelector(`style[data-style-hash="${styleHash}"]`);
      if (existingElement) {
        return;
      }
    }

    const { css } = registry.cache.get(styleHash) || {};
    if (css) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-style-hash", styleHash);
      styleElement.innerHTML = `@layer ${layer} {\n${css}\n}`;
      if (prepend) {
        injectionTarget.insertBefore(styleElement, injectionTarget.firstChild?.nextSibling ?? null);
      } else {
        injectionTarget.appendChild(styleElement);
      }
      registry.injected.add(styleHash);
    }
  }, [layer, prepend, registry, styleHash, injectionTarget]);

  useEffect(() => {
    if (!styleHash || !injectionTarget) {
      return;
    }
    registry.incrementRef(styleHash);

    return () => {
      registry.decrementRef(styleHash);
      setTimeout(() => {
        if (registry.getRefCount(styleHash) === 0 && !registry.ssrHashes.has(styleHash)) {
          registry.injected.delete(styleHash);
          injectionTarget.querySelector(`style[data-style-hash="${styleHash}"]`)?.remove();
        }
      }, 0);
    };
  }, [injectionTarget, registry, styleHash]);

  return className;
}
