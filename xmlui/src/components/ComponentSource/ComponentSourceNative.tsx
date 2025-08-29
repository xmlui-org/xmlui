import React, { useState, useEffect, useRef, useMemo } from "react";
import { xmlUiMarkupToComponent } from "../../components-core/xmlui-parser";

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
  }, [componentName]);

    // Function to extract component source from file content
  const extractComponentFromFile = (fileContent: string, componentName: string): string => {
    console.log('ComponentSource: Extracting component from file:', componentName);

    // For Main.xmlui, return the whole file
    if (componentName === 'Main' || componentName === 'App') {
      return fileContent;
    }

    // Validate XMLUI syntax first using the parser
    try {
      const { component, errors } = xmlUiMarkupToComponent(fileContent);

      if (errors.length > 0) {
        console.log('ComponentSource: XMLUI syntax errors:', errors);
        // Continue with regex extraction even if there are syntax errors
      }

      // Check if it's a compound component (has a name property)
      if (!component || !('name' in component)) {
        console.log('ComponentSource: Not a compound component, returning whole file');
        return fileContent;
      }

      console.log('ComponentSource: XMLUI syntax validated, extracting component content');
    } catch (error) {
      console.log('ComponentSource: Parser error, continuing with extraction:', error);
    }

    // Extract the specific component content using regex
    return extractComponentContent(fileContent, componentName);
  };

  // Extract component content using regex
  const extractComponentContent = (fileContent: string, componentName: string): string => {
    console.log('ComponentSource: Extracting component content for:', componentName);

    const startTag = new RegExp(`<Component\\s+name="${componentName}"[^>]*>`, 'i');
    const startMatch = fileContent.match(startTag);

    if (startMatch) {
      const startIndex = startMatch.index! + startMatch[0].length;
      let depth = 1;
      let endIndex = startIndex;

      // Find the matching closing tag by counting opening/closing tags
      for (let i = startIndex; i < fileContent.length; i++) {
        const char = fileContent[i];
        if (char === '<') {
          const tagStart = i;
          const tagEnd = fileContent.indexOf('>', tagStart);
          if (tagEnd === -1) break;

          const tag = fileContent.substring(tagStart, tagEnd + 1);

          if (tag.match(/<Component[^>]*>/i)) {
            depth++;
          } else if (tag.match(/<\/Component>/i)) {
            depth--;
            if (depth === 0) {
              endIndex = tagStart;
              break;
            }
          }
        }
      }

      if (depth === 0) {
        const content = fileContent.substring(startIndex, endIndex);
        console.log('ComponentSource: Found component content, length:', content.length);
        return content;
      }
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
        if (uid && (uid.includes('app') || uid.includes('App'))) {
          targetComponentName = 'Main';
        } else if (uid) {
          // Extract component name from uid (e.g., "TestSourceCode" -> "Test")
          const uidParts = uid.replace('SourceCode', '').split(/(?=[A-Z])/);
          const lastPart = uidParts[uidParts.length - 1]; // Get the last part
          // The component name should already be properly capitalized
          targetComponentName = lastPart;
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
