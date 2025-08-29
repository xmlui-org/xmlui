import React, { useState, useEffect, useRef, useMemo } from "react";

export interface ComponentSourceProps {
  autoLoad?: boolean;
  onSourceLoaded?: (sourceCode: string) => void;
  onError?: (error: string) => void;
  updateState?: (updates: any) => void;
  componentName?: string;
  uid?: string;
}

export const defaultProps: ComponentSourceProps = {
  autoLoad: true,
};

export function ComponentSource({
  autoLoad = defaultProps.autoLoad,
  onSourceLoaded,
  onError,
  updateState,
  componentName,
  uid,
}: ComponentSourceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to extract source code using file-based approach only
  const extractSourceCode = useMemo(() => {
    console.log('ComponentSource: Using file-based approach');
    return null; // Will be handled in fetchSourceCode
  }, [componentName, uid]);

  // Function to extract component source from file content
  const extractComponentFromFile = (fileContent: string, componentName: string): string => {
    console.log('ComponentSource: Extracting component from file:', componentName);

    // For Main.xmlui, return the whole file
    if (componentName === 'Main' || componentName === 'App') {
      return fileContent;
    }

    // For component files, look for the Component definition
    const componentPattern = new RegExp(`<Component\\s+name="${componentName}"[^>]*>([\\s\\S]*?)</Component>`, 'i');
    const match = fileContent.match(componentPattern);

    if (match) {
      console.log('ComponentSource: Found component in file');
      return match[1]; // Return the component content
    }

    // If no Component tag found, return the whole file
    console.log('ComponentSource: No Component tag found, returning whole file');
    return fileContent;
  };

    const fetchSourceCode = async () => {
    console.log('ComponentSource fetchSourceCode - using file-based approach');
    setIsLoading(true);
    setError("");

    try {
      // Determine which component to fetch
      let targetComponentName = componentName;

      if (!targetComponentName) {
        if (uid && uid.includes('app')) {
          targetComponentName = 'Main';
        } else if (uid) {
          // Extract component name from uid (e.g., "testSourceCode" -> "Test")
          const uidParts = uid.replace('SourceCode', '').split(/(?=[A-Z])/);
          targetComponentName = uidParts[uidParts.length - 1]; // Get the last part
        }
      }

      if (!targetComponentName) {
        throw new Error('Could not determine component name from context');
      }

      console.log('ComponentSource: Fetching component file for:', targetComponentName);

      // Construct file path based on component name
      let filePath;
      if (targetComponentName === 'Main' || targetComponentName === 'App') {
        filePath = 'Main.xmlui';
      } else {
        filePath = `components/${targetComponentName}.xmlui`;
      }

      console.log('ComponentSource: Fetching file:', filePath);

      // Fetch the component file
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
      }

      const fileContent = await response.text();
      console.log('ComponentSource: Successfully fetched file, length:', fileContent.length);

      // Extract the component source from the file
      const sourceCode = extractComponentFromFile(fileContent, targetComponentName);

      if (!sourceCode) {
        throw new Error('Could not extract source code for current context');
      }

      console.log('ComponentSource: Successfully extracted source code');

      // Update the component state so it's available through the id binding
      updateState?.({ value: sourceCode, isLoading: false, error: "" });
      onSourceLoaded?.(sourceCode);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract source code';
      setError(errorMessage);
      updateState?.({ error: errorMessage, isLoading: false });
      onError?.(errorMessage);
      console.error('Error extracting source code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      fetchSourceCode();
    }
  }, [autoLoad, extractSourceCode]);

  // This is a non-visual component that only provides data through updateState
  return <div ref={containerRef} style={{ display: 'none' }} />;
}
