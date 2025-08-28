import React, { useState, useEffect, useRef } from "react";
import { createComponentRenderer, createMetadata } from "xmlui";

export interface PageSourceProps {
  autoLoad?: boolean;
  onSourceLoaded?: (sourceCode: string) => void;
  onError?: (error: string) => void;
  updateState?: (updates: any) => void;
}

export const defaultProps: PageSourceProps = {
  autoLoad: true,
};

export function PageSource({
  autoLoad = defaultProps.autoLoad,
  onSourceLoaded,
  onError,
  updateState,
}: PageSourceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSourceCode = async () => {
    console.log('PageSource fetchSourceCode - trying to find current context source');
    setIsLoading(true);
    setError("");

    try {
      // Get the container element and traverse up the DOM tree to find context
      const containerElement = containerRef.current;
      if (!containerElement) {
        throw new Error('Container element not found');
      }

      // Traverse up the DOM tree from the container to find Page and App ancestors using CSS classes
      const pageAncestor = containerElement.closest('[class*="xmlui-page"], [class*="page-root"], [class*="page"]');
      const appAncestor = containerElement.closest('[class*="xmlui-app"], [class*="app-root"], [class*="app"]');

      console.log('PageSource context check:');
      console.log('- Page ancestor found:', !!pageAncestor);
      console.log('- App ancestor found:', !!appAncestor);

      let sourceUrl = "";

      if (pageAncestor) {
        // We're inside a Page component - show the Page's component source
        // Try to get URL from various possible attributes
        const pageUrl = pageAncestor.getAttribute('data-xmlui-url') ||
                       pageAncestor.getAttribute('data-url') ||
                       pageAncestor.getAttribute('data-route') ||
                       pageAncestor.getAttribute('data-path');
        console.log('PageSource found page URL:', pageUrl);

        // If no URL attribute found, try to get from the current hash
        let finalPageUrl = pageUrl;
        if (!finalPageUrl) {
          const hash = window.location.hash;
          if (hash && hash.startsWith('#/')) {
            finalPageUrl = hash.substring(2); // Remove '#/'
            console.log('PageSource using hash URL as fallback:', finalPageUrl);
          }
        }

        if (finalPageUrl) {
          // Map the page URL to component file path
          // e.g., "test" -> "components/Test.xmlui"
          const componentName = finalPageUrl.split('/').pop() || finalPageUrl;
          const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
          sourceUrl = `components/${capitalizedName}.xmlui`;
          console.log('PageSource constructed page source URL:', sourceUrl);
        }
      } else if (appAncestor) {
        // We're at App level - show Main.xmlui
        sourceUrl = "Main.xmlui";
        console.log('PageSource using App level source URL:', sourceUrl);
      } else {
        // Fallback: try to get from window.location hash
        const hash = window.location.hash;
        if (hash && hash.startsWith('#/')) {
          const currentPageUrl = hash.substring(2); // Remove '#/'
          const componentName = currentPageUrl.split('/').pop() || currentPageUrl;
          const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
          sourceUrl = `components/${capitalizedName}.xmlui`;
          console.log('PageSource fallback - constructed source URL:', sourceUrl);
        }
      }

      if (!sourceUrl) {
        throw new Error('Could not determine source URL for current context');
      }

      console.log('PageSource final source URL:', sourceUrl);

      const response = await fetch(sourceUrl);
      console.log('PageSource response status:', response.status);
      console.log('PageSource response URL:', response.url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      console.log('PageSource fetched content length:', text.length);
      console.log('PageSource fetched content preview:', text.substring(0, 100));

      // Update the component state so it's available through the id binding
      updateState?.({ value: text, isLoading: false, error: "" });
      onSourceLoaded?.(text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load source code';
      setError(errorMessage);
      updateState?.({ error: errorMessage, isLoading: false });
      onError?.(errorMessage);
      console.error('Error loading source code:', err);
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

// Component metadata
const PageSourceMd = createMetadata({
  description: "PageSource component that fetches and exposes the source code of the current page/component",
  status: "experimental",
  props: {
    autoLoad: {
      description: "Whether to automatically load the source code on mount",
      isRequired: false,
      type: "boolean",
      defaultValue: true,
    },
    onSourceLoaded: {
      description: "Callback function called when source code is loaded",
      isRequired: false,
      type: "function",
    },
    onError: {
      description: "Callback function called when an error occurs",
      isRequired: false,
      type: "function",
    },
  },
});

// Component renderer for XMLUI
export const pageSourceComponentRenderer = createComponentRenderer(
  "PageSource",
  PageSourceMd,
  ({ node, extractValue, updateState }: any) => {
    const autoLoad = extractValue.asOptionalBoolean(node.props?.autoLoad, true);
    const onSourceLoaded = extractValue(node.props?.onSourceLoaded);
    const onError = extractValue(node.props?.onError);

    return (
      <PageSource
        autoLoad={autoLoad}
        onSourceLoaded={onSourceLoaded}
        onError={onError}
        updateState={updateState}
      />
    );
  },
);

export default PageSource;

