import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDevTools } from "xmlui";

export interface ComponentSourceProps {
  autoLoad?: boolean;
  onSourceLoaded?: (sourceCode: string) => void;
  onError?: (error: string) => void;
  updateState?: (updates: any) => void;
  componentName?: string; // Add component name prop
  uid?: string; // Add uid prop to identify the component
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

  // Function to extract source code using inspector's logic
  const extractSourceCode = useMemo(() => {
    if (!sources || !projectCompilation) {
      return "";
    }

    // Try to find the component by name in the project compilation
    let targetComponent = null;

    if (componentName) {
      // Look for the specific component by name
      targetComponent = projectCompilation.components.find(comp =>
        comp.name === componentName || comp.markupSource.includes(`<Component name="${componentName}">`)
      );
    } else {
      // Try to determine from uid context
      if (uid && uid.includes('app')) {
        // For App context, look for the main App component
        targetComponent = projectCompilation.components.find(comp =>
          comp.markupSource.includes('<App>') && !comp.markupSource.includes('<Component name=')
        );
      } else if (uid) {
        // Extract component name from uid (e.g., "testSourceCode" -> "Test")
        const uidParts = uid.replace('SourceCode', '').split(/(?=[A-Z])/);
        const possibleName = uidParts[uidParts.length - 1]; // Get the last part
        if (possibleName) {
          targetComponent = projectCompilation.components.find(comp =>
            comp.name === possibleName || comp.markupSource.includes(`<Component name="${possibleName}">`)
          );
        }
      }
    }

    if (!targetComponent) {
      console.log('ComponentSource: No target component found');
      return "";
    }

    console.log('ComponentSource: Found target component:', targetComponent.name);

    // Use the inspector's source extraction logic
    const compSrc = targetComponent.debug?.source;
    if (!compSrc) {
      console.log('ComponentSource: No debug source info found');
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
  }, [sources, projectCompilation, componentName, uid]);

  const fetchSourceCode = async () => {
    console.log('ComponentSource fetchSourceCode - using inspector source extraction');
    setIsLoading(true);
    setError("");

    try {
      const sourceCode = extractSourceCode;

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

  // Auto-load source code if requested
  useEffect(() => {
    if (autoLoad) {
      fetchSourceCode();
    }
  }, [autoLoad]);

  // Non-visual component - just a hidden div for DOM traversal
  return (
    <div ref={containerRef} style={{ display: 'none' }} />
  );
}

export default ComponentSource;