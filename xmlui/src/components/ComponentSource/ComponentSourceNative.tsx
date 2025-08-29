import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDevTools } from "../../components-core/InspectorContext";

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

  // Try to use the inspector's dev tools, but fall back gracefully if not available
  let sources, projectCompilation;
  try {
    const devTools = useDevTools();
    sources = devTools.sources;
    projectCompilation = devTools.projectCompilation;
  } catch (error) {
    console.log('ComponentSource: Inspector not available, falling back to file-based approach');
    sources = null;
    projectCompilation = null;
  }

  // Function to extract source code using inspector's logic or file-based fallback
  const extractSourceCode = useMemo(() => {
    // Try inspector approach first if available
    if (sources && projectCompilation && projectCompilation.components?.length > 0) {
      // Try to find the component by name in the project compilation
      let targetComponent = null;

      if (componentName) {
        // Look for the specific component by name
        targetComponent = projectCompilation.components.find(comp =>
          comp.definition.name === componentName || comp.markupSource?.includes(`<Component name="${componentName}">`)
        );
      } else {
        // Try to determine from uid context
        if (uid && uid.includes('app')) {
          // For App context, look for the main App component
          targetComponent = projectCompilation.components.find(comp =>
            comp.markupSource?.includes('<App>') && !comp.markupSource.includes('<Component name=')
          );
        } else if (uid) {
          // Extract component name from uid (e.g., "testSourceCode" -> "Test")
          const uidParts = uid.replace('SourceCode', '').split(/(?=[A-Z])/);
          const possibleName = uidParts[uidParts.length - 1]; // Get the last part
          if (possibleName) {
            targetComponent = projectCompilation.components.find(comp =>
              comp.definition.name === possibleName || comp.markupSource?.includes(`<Component name="${possibleName}">`)
            );
          }
        }
      }

      if (targetComponent) {
        console.log('ComponentSource: Found target component via inspector:', targetComponent.definition.name);

        // Use the inspector's source extraction logic
        const compSrc = targetComponent.debug?.source;
        if (!compSrc) {
          console.log('ComponentSource: No debug source info found, using full markup');
          return targetComponent.markupSource; // Fallback to full markup
        }

        const { start, end, fileId } = compSrc;
        const slicedSrc = sources[fileId].slice(start, end);

        // Apply the inspector's formatting logic
        let dropEmptyLines = true;
        const prunedLines: Array<string> = [];
        let trimBeginCount: number | undefined = undefined;

        slicedSrc.split("\n").forEach((line) => {
          if (line.trim() === "" && dropEmptyLines) {
            // Drop empty lines from the beginning
            return;
          } else {
            dropEmptyLines = false;
            prunedLines.push(line);
            const startingWhiteSpaces = line.search(/\S|$/);
            if (
              line.trim() !== "" &&
              (trimBeginCount === undefined || startingWhiteSpaces < trimBeginCount)
            ) {
              trimBeginCount = startingWhiteSpaces;
            }
          }
        });

        const formattedSource = prunedLines
          .map((line) => line.slice(trimBeginCount).replace(/inspect="true"/g, ""))
          .join("\n");

        console.log('ComponentSource: Extracted source length:', formattedSource.length);
        return formattedSource;
      }
    }

    // Fallback to file-based approach
    console.log('ComponentSource: Using file-based approach');
    return null; // Will be handled in fetchSourceCode
  }, [sources, projectCompilation, componentName, uid]);

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
    console.log('ComponentSource fetchSourceCode - trying inspector first, then file-based');
    setIsLoading(true);
    setError("");

    try {
      // Try inspector approach first
      let sourceCode = extractSourceCode;

      // If inspector approach didn't work, try file-based approach
      if (!sourceCode) {
        console.log('ComponentSource: Inspector approach failed, trying file-based');

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
        sourceCode = extractComponentFromFile(fileContent, targetComponentName);
      }

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
