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

function TestBed({ styleRegistry }: { styleRegistry?: StyleRegistry }) {
  const [extensionManager, setExtensionManager] = useState<StandaloneExtensionManager | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExtensions = async () => {
      const manager = new StandaloneExtensionManager();

      const extensionIds = window.TEST_EXTENSION_IDS;
      if (extensionIds && extensionIds.length > 0) {
        try {
          // Load all requested extensions from registry
          for (const extensionId of extensionIds) {
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
        } catch (error) {
          console.error("Failed to load extensions:", error);
          setError(`Failed to load extensions: ${error}`);
        }
      }

      setExtensionManager(manager);
    };

    void loadExtensions();
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
