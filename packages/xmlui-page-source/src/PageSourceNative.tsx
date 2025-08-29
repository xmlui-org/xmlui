import React, { useState, useEffect, useRef } from "react";
import { createComponentRenderer, createMetadata } from "xmlui";

export interface PageSourceProps {
  autoLoad?: boolean;
  onSourceLoaded?: (sourceCode: string) => void;
  onError?: (error: string) => void;
  updateState?: (updates: any) => void;
  componentName?: string; // Add component name prop
  uid?: string; // Add uid prop to identify the component
}

export const defaultProps: PageSourceProps = {
  autoLoad: true,
};

export function PageSource({
  autoLoad = defaultProps.autoLoad,
  onSourceLoaded,
  onError,
  updateState,
  componentName,
  uid,
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

      // Debug: Log the container element and its immediate parent
      console.log('PageSource container element:', containerElement);
      console.log('PageSource container parent:', containerElement.parentElement);
      console.log('PageSource container parent class:', containerElement.parentElement?.className);
      console.log('PageSource container parent attributes:', containerElement.parentElement?.getAttributeNames());

      // Traverse up the DOM tree and log all elements and their attributes
      let currentElement = containerElement.parentElement;
      let depth = 0;
      while (currentElement && depth < 10) {
        console.log(`PageSource DOM level ${depth}:`, currentElement.tagName, currentElement.className);
        console.log(`PageSource DOM level ${depth} attributes:`, currentElement.getAttributeNames());
        currentElement.getAttributeNames().forEach(attr => {
          console.log(`  - ${attr}:`, currentElement.getAttribute(attr));
        });
        currentElement = currentElement.parentElement;
        depth++;
      }

      // Try different selectors to find XMLUI components
      console.log('PageSource trying different selectors:');
      console.log('- [data-xmlui-component]:', document.querySelectorAll('[data-xmlui-component]').length);
      console.log('- [data-component]:', document.querySelectorAll('[data-component]').length);
      console.log('- [data-name]:', document.querySelectorAll('[data-name]').length);
      console.log('- [class*="xmlui"]:', document.querySelectorAll('[class*="xmlui"]').length);
      console.log('- [class*="component"]:', document.querySelectorAll('[class*="component"]').length);
      console.log('- [class*="page"]:', document.querySelectorAll('[class*="page"]').length);
      console.log('- [class*="app"]:', document.querySelectorAll('[class*="app"]').length);

      // Traverse up the DOM tree from the container to find Page, Component, and App ancestors using CSS classes
      const pageAncestor = containerElement.closest('[class*="xmlui-page"], [class*="page-root"], [class*="page"]');
      const componentAncestor = containerElement.closest('[class*="xmlui-component"], [class*="component-root"], [class*="component"]');
      const appAncestor = containerElement.closest('[class*="xmlui-app"], [class*="app-root"], [class*="app"]');

      console.log('PageSource context check:');
      console.log('- Page ancestor found:', !!pageAncestor);
      console.log('- Component ancestor found:', !!componentAncestor);
      console.log('- App ancestor found:', !!appAncestor);

      let sourceUrl = "";

            // If componentName is provided, use it directly
      if (componentName) {
        console.log('PageSource using provided component name:', componentName);
        sourceUrl = `components/${componentName}.xmlui`;
      } else {
        // Try to determine context from uid or URL/hash
        console.log('PageSource uid:', uid);

        // If we have a specific uid that indicates we're in a component context
        if (uid && uid.includes('test')) {
          // We're in the Test component context
          sourceUrl = 'components/Test.xmlui';
          console.log('PageSource using Test component source URL based on uid:', sourceUrl);
        } else {
          // Default to Main.xmlui
          sourceUrl = 'Main.xmlui';
          console.log('PageSource using Main.xmlui source URL:', sourceUrl);
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
  ({ node, extractValue, updateState, appContext }: any) => {
    console.log('PageSource renderer called with node:', node);
    console.log('PageSource renderer node.parent:', node.parent);
    console.log('PageSource renderer node.parent?.type:', node.parent?.type);
    console.log('PageSource renderer node.parent?.name:', node.parent?.name);

    const autoLoad = extractValue.asOptionalBoolean(node.props?.autoLoad, true);
    const onSourceLoaded = extractValue(node.props?.onSourceLoaded);
    const onError = extractValue(node.props?.onError);

    // Try to get component name from various sources
    let componentName = null;

    // Check if we're in a component context by looking at the node's parent
    if (node.parent && node.parent.type === "Component") {
      componentName = node.parent.name;
      console.log('PageSource renderer found component name from parent:', componentName);
    }

    // Also check if we're in a page context
    if (!componentName && node.parent && node.parent.type === "Page") {
      const pageUrl = node.parent.props?.url;
      if (pageUrl) {
        const pageName = pageUrl.split('/').pop() || pageUrl;
        componentName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        console.log('PageSource renderer found page name:', componentName);
      }
    }

    console.log('PageSource renderer final componentName:', componentName);

    return (
      <PageSource
        autoLoad={autoLoad}
        onSourceLoaded={onSourceLoaded}
        onError={onError}
        updateState={updateState}
        componentName={componentName}
        uid={node.uid}
      />
    );
  },
);

export default PageSource;

