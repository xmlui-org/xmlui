import type { CSSProperties } from "react";
import type React from "react";
import { createContext, useContext, useEffect, useInsertionEffect, useMemo, useState } from "react";
import type { StyleObjectType } from "./StyleRegistry";
import { StyleRegistry } from "./StyleRegistry";
import { EMPTY_OBJECT } from "../constants";
import { useIndexerContext } from "../../components/App/IndexerContext";

// The context is typed to hold either a StyleRegistry instance or null.
const StyleContext = createContext<StyleRegistry | null>(null);

type StyleProviderProps = {
  children: React.ReactNode;
  styleRegistry?: StyleRegistry;
  forceNew?: boolean; // Optional prop to force a new registry
};

/**
 * A "smart" provider that creates a StyleRegistry only if one doesn't
 * already exist in the context.
 */
export function StyleProvider({
  children,
  styleRegistry = new StyleRegistry(),
  forceNew = false, // Optional prop to force a new registry
}: StyleProviderProps) {
  // Check if a provider already exists above this one in the tree.
  const parentRegistry = useContext(StyleContext);
  // If we are the top-most provider, create a new registry for this tree.
  // On the client, this runs once. On the server, it runs once per request
  // IF this provider is at the root of the tree being rendered.
  // Use useState to create the registry instance.
  const [registry] = useState(() => {
    const newRegistry = styleRegistry;

    // This logic only runs on the CLIENT, once, when the registry is created.
    if (typeof window !== "undefined") {
      // 1. Find the style tag injected by the server.
      const ssrTag = document.querySelector('style[data-style-registry="true"]');
      // 2. Read the hashes from our custom data attribute.
      const ssrHashes = ssrTag?.getAttribute("data-ssr-hashes");

      if (ssrHashes) {
        // 3. Pre-populate the 'injected' set with all the server-rendered hashes.
        let hashes = ssrHashes.split(",");
        newRegistry.ssrHashes = new Set(hashes);
        newRegistry.injected = new Set(hashes);
      }
    }

    return newRegistry;
  });

  // If we're already inside a provider, don't do anything. Just render the children.
  // This makes nesting StyleProviders safe and harmless.
  if (parentRegistry && !forceNew) {
    return <>{children}</>;
  }

  return <StyleContext.Provider value={registry}>{children}</StyleContext.Provider>;
}

export function useStyleRegistry(): StyleRegistry {
  const registry = useContext(StyleContext);
  if (registry === null) {
    throw new Error("Component must be used within a StyleProvider");
  }
  return registry;
}

export function useComponentStyle(styles?: Record<string, CSSProperties[keyof CSSProperties]>) {
  const rootStyle = useMemo(() => {
    return !styles || Object.keys(styles).length === 0
      ? EMPTY_OBJECT
      : {
          "&": styles,
          // "@container style(--screenSize: 1) or @container style(--screenSize: 2) ... etc": responsiveSizes,
        };
  }, [styles]);

  return useStyles(rootStyle);
}

export const StyleInjectionTargetContext = createContext<Document | ShadowRoot | null>(null);

export function useDomRoot() {
  const domRoot = useContext(StyleInjectionTargetContext);
  return domRoot;
}

type InjectOptions = {
  prepend?: boolean;
};
export function useStyles(
  styles: StyleObjectType,
  { prepend }: InjectOptions = EMPTY_OBJECT,
): string {
  // we skip this whole thing if we're indexing
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
    return registry.register(styles);
  }, [indexing, registry, styles]);

  useInsertionEffect(() => {
    if (!styleHash || registry.injected.has(styleHash)) {
      return;
    }

    const { css } = registry.cache.get(styleHash) || {};
    if (css) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-style-hash", styleHash);
      styleElement.innerHTML = `@layer dynamic {\n${css}\n}`;
      if (prepend) {
        injectionTarget.insertBefore(styleElement, injectionTarget.firstChild.nextSibling);
      } else {
        injectionTarget.appendChild(styleElement);
      }

      registry.injected.add(styleHash);
    }
  }, [registry, styleHash, injectionTarget]);

  // HOOK 2: For lifecycle management (reference counting and CLEANUP).
  useEffect(() => {
    if (!styleHash) {
      return;
    }
    // On MOUNT, tell the registry that this component is using this style.
    registry.incrementRef(styleHash);

    // Return a cleanup function to run on UNMOUNT.
    return () => {
      registry.decrementRef(styleHash);

      // Schedule the cleanup check to run asynchronously.
      // This allows React's Strict Mode double-render to complete before
      // we check if the style tag should be removed.
      setTimeout(() => {
        // Only proceed with cleanup if...
        // 1. No other component is using this style (ref count is 0).
        // 2. This style was NOT part of the initial server render.
        if (registry.getRefCount(styleHash) === 0 && !registry.ssrHashes.has(styleHash)) {
          // If it's still zero, it means no component re-mounted to claim this style.
          // Now it's safe to perform the cleanup.
          registry.injected.delete(styleHash);
          injectionTarget.querySelector(`style[data-style-hash="${styleHash}"]`)?.remove();
        }
      }, 0); // A timeout of 0ms is sufficient to push this to the end of the event loop.
    };
  }, [injectionTarget, registry, styleHash]); // Dependency array ensures this runs once per style change.

  return className;
}
