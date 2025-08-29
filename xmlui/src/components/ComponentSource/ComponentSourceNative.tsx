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
  }, [componentName, uid]);

    // Function to extract component source from file content using the XMLUI parser
  const extractComponentFromFile = (fileContent: string, componentName: string): string => {
    console.log('ComponentSource: Extracting component from file using XMLUI parser:', componentName);

    // For Main.xmlui, return the whole file
    if (componentName === 'Main' || componentName === 'App') {
      return fileContent;
    }

    try {
      // Use the actual XMLUI parser to parse the file
      const { component, errors } = xmlUiMarkupToComponent(fileContent);

      if (errors.length > 0) {
        console.log('ComponentSource: Parser errors:', errors);
        // Fall back to regex if parser fails
        return extractComponentWithRegex(fileContent, componentName);
      }

      // Check if it's a compound component (has a name property)
      if (!component || !('name' in component)) {
        console.log('ComponentSource: Not a compound component, returning whole file');
        return fileContent;
      }

      // For compound components, we need to extract the specific component by name
      // The parser gives us the whole file, so we need to find the specific component
      // Let's use the regex approach for now since the parser doesn't give us individual components
      console.log('ComponentSource: Compound component found, using regex to extract specific component');
      return extractComponentWithRegex(fileContent, componentName);
    } catch (error) {
      console.log('ComponentSource: Parser error, falling back to regex:', error);
      return extractComponentWithRegex(fileContent, componentName);
    }
  };

  // Fallback regex-based extraction
  const extractComponentWithRegex = (fileContent: string, componentName: string): string => {
    console.log('ComponentSource: Using regex fallback for:', componentName);

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
        console.log('ComponentSource: Found component via regex, content length:', content.length);
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
          if (uid && uid.includes('app')) {
            targetComponentName = 'Main';
          } else if (uid) {
            // Extract component name from uid (e.g., "testSourceCode" -> "Test")
            const uidParts = uid.replace('SourceCode', '').split(/(?=[A-Z])/);
            const lastPart = uidParts[uidParts.length - 1]; // Get the last part
            // Capitalize the first letter to match the actual component name
            targetComponentName = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
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
