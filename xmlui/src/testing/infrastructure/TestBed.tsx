// import { StandaloneApp } from "";
// import type { StandaloneAppDescription } from "xmlui";
import { useState, useEffect } from "react";
import StandaloneApp from "../../../src/components-core/StandaloneApp";
import type { StandaloneAppDescription } from "../../../src/components-core/abstractions/standalone";
import StandaloneExtensionManager from "../../../src/components-core/StandaloneExtensionManager";
import "xmlui/index.scss";

declare global {
  interface Window {
    TEST_ENV: any | undefined;
    TEST_RUNTIME: any;
    TEST_EXTENSION_ID?: string;
  }
}

function TestBed() {
  const [extensionManager, setExtensionManager] = useState<StandaloneExtensionManager | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExtension = async () => {
      const manager = new StandaloneExtensionManager();
      
      const extensionId = window.TEST_EXTENSION_ID;
      if (extensionId) {
        try {
          // Map of known test extensions
          let extensionModule;
          switch (extensionId) {
            case "xmlui-pdf":
              extensionModule = await import("../../../../packages/xmlui-pdf/src/index");
              break;
            default:
              throw new Error(`Unknown extension ID: ${extensionId}`);
          }
          
          if (extensionModule.default) {
            manager.registerExtension(extensionModule.default);
          } else {
            setError("Extension module has no default export");
          }
        } catch (error) {
          console.error("Failed to load extension:", error);
          setError(`Failed to load extension: ${error}`);
        }
      }
      
      setExtensionManager(manager);
    };
    
    loadExtension();
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
