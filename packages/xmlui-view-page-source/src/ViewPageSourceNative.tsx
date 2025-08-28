import React, { useState, useRef } from "react";

export interface ViewPageSourceProps {
  label?: string;
  icon?: string;
  variant?: "solid" | "outlined" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export const defaultProps: ViewPageSourceProps = {
  label: "View Source",
  icon: "code",
  variant: "outlined",
  size: "sm",
};

export function ViewPageSource({
  label = defaultProps.label,
  icon = defaultProps.icon,
  variant = defaultProps.variant,
  size = defaultProps.size,
  className,
  style,
}: ViewPageSourceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceCode, setSourceCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = async () => {
    console.log('ViewPageSource handleClick - trying to find current context source');
    setIsOpen(true);
    setIsLoading(true);
    setError("");

    try {
      // Get the button element and traverse up the DOM tree to find context
      const buttonElement = buttonRef.current;
      if (!buttonElement) {
        throw new Error('Button element not found');
      }

      console.log('ViewPageSource button element:', buttonElement);

      // Debug: Inspect the DOM structure around the button
      console.log('ViewPageSource DOM debugging:');
      console.log('- Button element:', buttonElement);
      console.log('- Button parent:', buttonElement.parentElement);
      console.log('- Button parent attributes:', buttonElement.parentElement?.getAttributeNames());

      // Traverse up the DOM tree and log all elements and their attributes
      let currentElement = buttonElement.parentElement;
      let depth = 0;
      while (currentElement && depth < 10) {
        console.log(`- Level ${depth} element:`, currentElement.tagName, currentElement.className);
        console.log(`- Level ${depth} attributes:`, currentElement.getAttributeNames());
        console.log(`- Level ${depth} data attributes:`, Array.from(currentElement.getAttributeNames()).filter(name => name.startsWith('data-')));

        // Check for any XMLUI-related attributes
        const allAttributes = currentElement.getAttributeNames();
        const xmluiAttributes = allAttributes.filter(name => name.includes('xmlui') || name.includes('component') || name.includes('page') || name.includes('app'));
        if (xmluiAttributes.length > 0) {
          console.log(`- Level ${depth} XMLUI attributes found:`, xmluiAttributes);
          xmluiAttributes.forEach(attr => {
            console.log(`  - ${attr}:`, currentElement.getAttribute(attr));
          });
        }

        currentElement = currentElement.parentElement;
        depth++;
      }

      // Try different selectors to find XMLUI components
      console.log('ViewPageSource trying different selectors:');
      console.log('- [data-xmlui-component="Page"]:', document.querySelectorAll('[data-xmlui-component="Page"]').length);
      console.log('- [data-xmlui-component="App"]:', document.querySelectorAll('[data-xmlui-component="App"]').length);
      console.log('- [class*="xmlui"]:', document.querySelectorAll('[class*="xmlui"]').length);
      console.log('- [class*="page"]:', document.querySelectorAll('[class*="page"]').length);
      console.log('- [class*="app"]:', document.querySelectorAll('[class*="app"]').length);

      // Try more specific class-based selectors
      console.log('- [class*="xmlui-page"]:', document.querySelectorAll('[class*="xmlui-page"]').length);
      console.log('- [class*="xmlui-app"]:', document.querySelectorAll('[class*="xmlui-app"]').length);
      console.log('- [class*="page-root"]:', document.querySelectorAll('[class*="page-root"]').length);
      console.log('- [class*="app-root"]:', document.querySelectorAll('[class*="app-root"]').length);

      // Traverse up the DOM tree from the button to find Page and App ancestors using CSS classes
      const pageAncestor = buttonElement.closest('[class*="xmlui-page"], [class*="page-root"], [class*="page"]');
      const appAncestor = buttonElement.closest('[class*="xmlui-app"], [class*="app-root"], [class*="app"]');

      console.log('ViewPageSource context check:');
      console.log('- Page ancestor found:', !!pageAncestor);
      console.log('- App ancestor found:', !!appAncestor);
      console.log('- Page ancestor element:', pageAncestor);
      console.log('- App ancestor element:', appAncestor);

      let sourceUrl = "";

      if (pageAncestor) {
        // We're inside a Page component - show the Page's component source
        // Debug: Show all attributes of the page ancestor
        console.log('ViewPageSource page ancestor details:');
        console.log('- Element:', pageAncestor);
        console.log('- All attributes:', pageAncestor.getAttributeNames());
        console.log('- Class name:', pageAncestor.className);
        console.log('- Inner HTML preview:', pageAncestor.innerHTML.substring(0, 200));

        // Try to get URL from various possible attributes
        const pageUrl = pageAncestor.getAttribute('data-xmlui-url') ||
                       pageAncestor.getAttribute('data-url') ||
                       pageAncestor.getAttribute('data-route') ||
                       pageAncestor.getAttribute('data-path');
        console.log('ViewPageSource found page URL:', pageUrl);

        // If no URL attribute found, try to get from the current hash
        let finalPageUrl = pageUrl;
        if (!finalPageUrl) {
          const hash = window.location.hash;
          if (hash && hash.startsWith('#/')) {
            finalPageUrl = hash.substring(2); // Remove '#/'
            console.log('ViewPageSource using hash URL as fallback:', finalPageUrl);
          }
        }

        if (finalPageUrl) {
          // Map the page URL to component file path
          // e.g., "test" -> "components/Test.xmlui"
          const componentName = finalPageUrl.split('/').pop() || finalPageUrl;
          const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
          sourceUrl = `components/${capitalizedName}.xmlui`;
          console.log('ViewPageSource constructed page source URL:', sourceUrl);
        }
      } else if (appAncestor) {
        // We're at App level - show Main.xmlui
        sourceUrl = "Main.xmlui";
        console.log('ViewPageSource using App level source URL:', sourceUrl);
      } else {
        // Fallback: try to find the active page using class-based selectors
        const pageElements = document.querySelectorAll('[class*="xmlui-page"], [class*="page-root"], [class*="page"]');
        console.log('ViewPageSource fallback - found page elements:', pageElements.length);

        let currentPageUrl = "";

        // Look for the active page (the one that's visible)
        for (const element of pageElements) {
          const style = window.getComputedStyle(element);
          if (style.display !== 'none' && style.visibility !== 'hidden') {
            // This is likely the active page
            const urlAttr = element.getAttribute('data-xmlui-url') ||
                           element.getAttribute('data-url') ||
                           element.getAttribute('data-route') ||
                           element.getAttribute('data-path');
            if (urlAttr) {
              currentPageUrl = urlAttr;
              console.log('ViewPageSource fallback - found active page URL:', currentPageUrl);
              break;
            }
          }
        }

        if (!currentPageUrl) {
          // Fallback: try to get from window.location hash
          const hash = window.location.hash;
          if (hash && hash.startsWith('#/')) {
            currentPageUrl = hash.substring(2); // Remove '#/'
            console.log('ViewPageSource fallback - using hash URL:', currentPageUrl);
          }
        }

        if (currentPageUrl) {
          // Map the page URL to component file path
          const componentName = currentPageUrl.split('/').pop() || currentPageUrl;
          const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
          sourceUrl = `components/${capitalizedName}.xmlui`;
          console.log('ViewPageSource fallback - constructed source URL:', sourceUrl);
        }
      }

      if (!sourceUrl) {
        throw new Error('Could not determine source URL for current context');
      }

      console.log('ViewPageSource final source URL:', sourceUrl);

      const response = await fetch(sourceUrl);
      console.log('ViewPageSource response status:', response.status);
      console.log('ViewPageSource response URL:', response.url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      console.log('ViewPageSource fetched content length:', text.length);
      console.log('ViewPageSource fetched content preview:', text.substring(0, 100));
      setSourceCode(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load source code');
      console.error('Error loading source code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        className={className}
        style={style}
        onClick={handleClick}
      >
        {icon && <span>📄</span>} {label}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '80%',
            maxHeight: '80%',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3>Source Code</h3>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              fontSize: '12px',
              minHeight: '200px'
            }}>
              {isLoading && "Loading source code..."}
              {error && <div style={{ color: 'red' }}>Error: {error}</div>}
              {!isLoading && !error && sourceCode && (
                <div>{sourceCode}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewPageSource;
