import React, { useState, useEffect, useRef } from "react";

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

  const fetchSourceCode = async () => {
    console.log('ComponentSource fetchSourceCode - trying to find current context source');
    setIsLoading(true);
    setError("");

    try {
      // Get the container element and traverse up the DOM tree to find context
      const containerElement = containerRef.current;
      if (!containerElement) {
        throw new Error('Container element not found');
      }

      // Debug: Log the container element and its immediate parent
      console.log('ComponentSource container element:', containerElement);
      console.log('ComponentSource container parent:', containerElement.parentElement);
      console.log('ComponentSource container parent class:', containerElement.parentElement?.className);
      console.log('ComponentSource container parent attributes:', containerElement.parentElement?.getAttributeNames());

      // Traverse up the DOM tree and log all elements and their attributes
      let currentElement = containerElement.parentElement;
      let depth = 0;
      while (currentElement && depth < 10) {
        console.log(`ComponentSource DOM level ${depth}:`, currentElement.tagName, currentElement.className);
        console.log(`ComponentSource DOM level ${depth} attributes:`, currentElement.getAttributeNames());
        currentElement.getAttributeNames().forEach(attr => {
          console.log(`  - ${attr}:`, currentElement.getAttribute(attr));
        });
        currentElement = currentElement.parentElement;
        depth++;
      }

      // Try different selectors to find XMLUI components
      console.log('ComponentSource trying different selectors:');
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

      console.log('ComponentSource context check:');
      console.log('- Page ancestor found:', !!pageAncestor);
      console.log('- Component ancestor found:', !!componentAncestor);
      console.log('- App ancestor found:', !!appAncestor);

      let sourceUrl = "";

      // If componentName is provided, use it directly
      if (componentName) {
        console.log('ComponentSource using provided component name:', componentName);
        sourceUrl = `components/${componentName}.xmlui`;
      } else {
        // Try to determine context from uid
        console.log('ComponentSource uid:', uid);

        // If we have a specific uid that indicates we're in a component context
        if (uid && uid.includes('test')) {
          // We're in the Test component context
          sourceUrl = 'components/Test.xmlui';
          console.log('ComponentSource using Test component source URL based on uid:', sourceUrl);
        } else if (uid && uid.includes('home')) {
          // We're in the Home component context
          sourceUrl = 'components/Home.xmlui';
          console.log('ComponentSource using Home component source URL based on uid:', sourceUrl);
        } else if (uid && uid.includes('app')) {
          // We're in the App context
          sourceUrl = 'Main.xmlui';
          console.log('ComponentSource using App source URL:', sourceUrl);
        } else {
          // Default to Main.xmlui
          sourceUrl = 'Main.xmlui';
          console.log('ComponentSource using Main.xmlui source URL:', sourceUrl);
        }
      }

      if (!sourceUrl) {
        throw new Error('Could not determine source URL for current context');
      }

      console.log('ComponentSource final source URL:', sourceUrl);

      const response = await fetch(sourceUrl);
      console.log('ComponentSource response status:', response.status);
      console.log('ComponentSource response URL:', response.url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      console.log('ComponentSource fetched content length:', text.length);
      console.log('ComponentSource fetched content preview:', text.substring(0, 100));

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

export default ComponentSource;