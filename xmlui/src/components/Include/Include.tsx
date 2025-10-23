import { useState, useEffect } from "react";
import type { ComponentRendererDef } from "../../abstractions/RendererDefs";
import { createMetadata, d } from "../metadata-helpers";
import { xmlUiMarkupToComponent, errReportComponent } from "../../components-core/xmlui-parser";

export const IncludeMd = createMetadata({
  status: "experimental",
  description: "Dynamically includes XMLUI markup from a remote URL",
  props: {
    url: d("URL to fetch XMLUI markup from"),
  },
});

export const includeComponentRenderer: ComponentRendererDef = {
  type: "Include",
  renderer: ({ 
    renderChild, 
    node, 
    extractValue, 
  }) => {
    const url = extractValue.asString(node.props?.url);
    
    const [componentDef, setComponentDef] = useState<any>(null);
    
    useEffect(() => {
      if (!url) return;
      
      let isMounted = true;
      
      const fetchComponent = async () => {
        if (!isMounted) return;
        
        try {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
          }

          const xmluiText = await response.text();
          
          if (!isMounted) return;
          
          const { errors, component, erroneousCompoundComponentName } = 
            xmlUiMarkupToComponent(xmluiText);
          
          if (errors.length > 0) {
            console.error('[Include] Parse errors:', errors);
            const errorComponent = errReportComponent(
              errors, 
              url, 
              erroneousCompoundComponentName
            );
            setComponentDef(errorComponent);
          } else {
            // Unwrap Component definitions to render their children
            if (component && component.type === 'Component') {
              setComponentDef(component.children || []);
            } else {
              setComponentDef(component);
            }
          }
        } catch (err) {
          if (!isMounted) return;
          console.error('[Include] Error loading XMLUI component:', err);
        }
      };
      
      fetchComponent();
      
      return () => {
        isMounted = false;
      };
    }, [url]);
    
    if (componentDef) {
      return renderChild(componentDef);
    }
    
    return null;
  },
  metadata: IncludeMd,
};
