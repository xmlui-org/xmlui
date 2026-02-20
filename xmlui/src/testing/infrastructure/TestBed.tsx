// import { StandaloneApp } from "";
// import type { StandaloneAppDescription } from "xmlui";
import { useState, useEffect } from "react";
import StandaloneApp from "../../../src/components-core/StandaloneApp";
import type { StandaloneAppDescription } from "../../../src/components-core/abstractions/standalone";
import StandaloneExtensionManager from "../../../src/components-core/StandaloneExtensionManager";
import { extensionRegistry } from "./extension-registry";
import "xmlui/index.scss";

declare global {
  interface Window {
    TEST_ENV: any | undefined;
    TEST_RUNTIME: any;
    TEST_EXTENSION_IDS?: string[];
  }
}

function TestBed() {
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
              throw new Error(`Unknown extension ID: ${extensionId}. Available: ${Object.keys(extensionRegistry).join(", ")}`);
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
    
    loadExtensions();
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
  
  return (
    <StandaloneApp 
      appDef={window.TEST_ENV} 
      runtime={window.TEST_RUNTIME} 
      extensionManager={extensionManager} 
      decorateComponentsWithTestId={true} 
      waitForApiInterceptor={true}
    />
  );
}

export default TestBed;
