import { useState, useEffect } from "react";
import { extensionRegistry } from "./extension-registry";
import { StandaloneApp, StyleProvider, StandaloneExtensionManager } from "xmlui";
import type { StyleRegistry } from "xmlui";

import "xmlui/index.scss";

declare global {
  interface Window {
    TEST_ENV: any | undefined;
    TEST_RUNTIME: any;
    TEST_EXTENSION_IDS?: string[];
  }
}

// Extension managers are cached for the lifetime of the page (per worker),
// keyed by the requested extension id set. The test bed remounts the whole
// app between tests via __XMLUI_REINIT__; without caching, every remount reset
// `extensionManager` to null (rendering "Loading...") and re-ran the async
// extension import. That extra async hop both slowed every test and, under
// parallel load, opened a race where a test could fail while still stuck on
// "Loading...". Caching makes the common case fully synchronous.
const extensionManagerCache = new Map<string, StandaloneExtensionManager>();
const extensionManagerLoadCache = new Map<string, Promise<StandaloneExtensionManager>>();

function extensionCacheKey(ids: string[]): string {
  return ids.slice().sort().join("|");
}

async function buildExtensionManager(ids: string[]): Promise<StandaloneExtensionManager> {
  const manager = new StandaloneExtensionManager();
  for (const extensionId of ids) {
    const importFn = extensionRegistry[extensionId];
    if (!importFn) {
      throw new Error(
        `Unknown extension ID: ${extensionId}. Available: ${Object.keys(extensionRegistry).join(", ")}`,
      );
    }
    const extensionModule = await importFn();
    if (extensionModule.default) {
      manager.registerExtension(extensionModule.default);
    } else {
      throw new Error(`Extension "${extensionId}" has no default export`);
    }
  }
  return manager;
}

function loadExtensionManager(cacheKey: string, ids: string[]): Promise<StandaloneExtensionManager> {
  const cached = extensionManagerCache.get(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }
  let promise = extensionManagerLoadCache.get(cacheKey);
  if (!promise) {
    promise = buildExtensionManager(ids).then((manager) => {
      extensionManagerCache.set(cacheKey, manager);
      extensionManagerLoadCache.delete(cacheKey);
      return manager;
    });
    extensionManagerLoadCache.set(cacheKey, promise);
  }
  return promise;
}

function TestBed({ styleRegistry }: { styleRegistry?: StyleRegistry }) {
  const extensionIds = window.TEST_EXTENSION_IDS ?? [];
  const cacheKey = extensionCacheKey(extensionIds);
  const [extensionManager, setExtensionManager] = useState<StandaloneExtensionManager | null>(
    () => {
      const cached = extensionManagerCache.get(cacheKey);
      if (cached) {
        return cached;
      }
      if (extensionIds.length === 0) {
        // No extensions to load: build + cache synchronously so there is no
        // "Loading..." flash for the ~98% of tests that use no extensions.
        const manager = new StandaloneExtensionManager();
        extensionManagerCache.set(cacheKey, manager);
        return manager;
      }
      return null;
    },
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (extensionManager) {
      // Already resolved synchronously (cached or no extensions).
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const manager = await loadExtensionManager(cacheKey, extensionIds);
        if (cancelled) {
          return;
        }
        setExtensionManager(manager);
      } catch (err) {
        extensionManagerLoadCache.delete(cacheKey);
        if (!cancelled) {
          console.error("Failed to load extensions:", err);
          setError(`Failed to load extensions: ${err}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!window.TEST_ENV) {
    return <div>Missing test env</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!extensionManager) {
    return <div>Loading...</div>;
  }

  // Only wait for API interceptor when the test actually provides one.
  // This avoids unnecessary MSW service worker setup for the ~98% of tests
  // that don't use apiInterceptor.
  const hasApiInterceptor = !!window.TEST_ENV?.apiInterceptor;

  const app = (
    <StandaloneApp
      appDef={window.TEST_ENV}
      runtime={window.TEST_RUNTIME}
      extensionManager={extensionManager}
      decorateComponentsWithTestId={true}
      waitForApiInterceptor={hasApiInterceptor}
    />
  );

  // If a stable registry is provided (test infrastructure reinit path), wrap
  // the app in an outer StyleProvider so that the inner StyleProvider inside
  // AppRoot is a no-op (it detects the parent context and skips creating a new
  // registry). This ensures old and new tree's useEffect cleanup/setup share the
  // same StyleRegistry instance, preventing the race where the old tree's
  // deferred setTimeout removes style tags that the new tree just injected.
  if (styleRegistry) {
    return <StyleProvider styleRegistry={styleRegistry}>{app}</StyleProvider>;
  }

  return app;
}

export default TestBed;
