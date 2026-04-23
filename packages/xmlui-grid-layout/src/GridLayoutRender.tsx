import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import * as ReactDOM from "react-dom";
import reactGridLayoutUrl from "react-grid-layout/dist/react-grid-layout.min.js?url";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

type ReactGridLayoutGlobal = {
  Responsive: React.ComponentType<any>;
  WidthProvider: (component: React.ComponentType<any>) => React.ComponentType<any>;
};

let reactGridLayoutPromise: Promise<ReactGridLayoutGlobal> | null = null;

async function loadReactGridLayout(): Promise<ReactGridLayoutGlobal> {
  if (typeof window === "undefined") {
    throw new Error("react-grid-layout is only available in the browser");
  }

  const win = window as typeof window & {
    React?: typeof React;
    ReactDOM?: typeof ReactDOM;
    ReactGridLayout?:
      | ReactGridLayoutGlobal
      | (React.ComponentType<any> & ReactGridLayoutGlobal);
  };

  const getGridLayoutApi = () => {
    const responsive = win.ReactGridLayout?.Responsive;
    const widthProvider = win.ReactGridLayout?.WidthProvider;

    if (responsive && widthProvider) {
      return {
        Responsive: responsive,
        WidthProvider: widthProvider,
      };
    }

    return null;
  };

  const existingApi = getGridLayoutApi();
  if (existingApi) {
    return existingApi;
  }

  if (!reactGridLayoutPromise) {
    reactGridLayoutPromise = new Promise<ReactGridLayoutGlobal>((resolve, reject) => {
      win.React ||= React;
      win.ReactDOM ||= ReactDOM;

      const existingScript = document.querySelector<HTMLScriptElement>(
        "script[data-xmlui-react-grid-layout]",
      );

      const handleReady = () => {
        const api = getGridLayoutApi();
        if (api) {
          resolve(api);
        } else {
          reactGridLayoutPromise = null;
          reject(new Error("react-grid-layout loaded without expected globals"));
        }
      };

      const handleError = () => {
        reactGridLayoutPromise = null;
        reject(new Error("Failed to load react-grid-layout"));
      };

      if (existingScript) {
        if (existingScript.dataset.loaded === "true") {
          handleReady();
          return;
        }
        existingScript.addEventListener("load", handleReady, { once: true });
        existingScript.addEventListener("error", handleError, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = reactGridLayoutUrl;
      script.async = true;
      script.dataset.xmluiReactGridLayout = "true";
      script.addEventListener(
        "load",
        () => {
          script.dataset.loaded = "true";
          handleReady();
        },
        { once: true },
      );
      script.addEventListener("error", handleError, { once: true });
      document.head.appendChild(script);
    });
  }

  return reactGridLayoutPromise;
}

function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const flat: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.props.children) {
      const inner = child.props.children;
      if (Array.isArray(inner)) {
        inner.forEach((c: React.ReactNode) => flat.push(c));
      } else {
        flat.push(child);
      }
    } else {
      flat.push(child);
    }
  });
  return flat;
}

/** Resolve a CSS value (possibly a var() reference) to a pixel number. */
function resolveCssLength(value: string, fallback: number): number {
  const num = parseFloat(value);
  if (!isNaN(num) && !value.includes("var(")) return num;
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.width = value;
  document.body.appendChild(el);
  const px = parseFloat(getComputedStyle(el).width) || fallback;
  document.body.removeChild(el);
  return px;
}

export const GridLayoutRender = memo(function GridLayoutRender({
  layout,
  columns = 12,
  rowHeight = 60,
  gap = "16px",
  draggable = true,
  resizable = true,
  compactType = "vertical",
  breakpoints,
  cols,
  className,
  draggableHandle,
  draggableCancel,
  onNativeEvent,
  children,
}: {
  layout?: any[];
  columns?: number;
  rowHeight?: number;
  gap?: string;
  draggable?: boolean;
  resizable?: boolean;
  compactType?: "vertical" | "horizontal" | null;
  breakpoints?: Record<string, number>;
  cols?: Record<string, number>;
  className?: string;
  draggableHandle?: string;
  draggableCancel?: string;
  onNativeEvent?: (event: any) => void;
  children?: React.ReactNode;
}) {
  const defaultBreakpoints = breakpoints || { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const defaultCols = cols || { lg: columns, md: columns, sm: columns, xs: columns, xxs: columns };

  const [resolvedGap, setResolvedGap] = useState(() => resolveCssLength(gap, 16));
  const [currentLayout, setCurrentLayout] = useState<any[]>(layout || []);
  const [gridLayoutApi, setGridLayoutApi] = useState<ReactGridLayoutGlobal | null>(null);

  useEffect(() => {
    setResolvedGap(resolveCssLength(gap, 16));
  }, [gap]);

  useEffect(() => {
    if (layout) setCurrentLayout(layout);
  }, [layout]);

  useEffect(() => {
    let cancelled = false;

    loadReactGridLayout()
      .then((api) => {
        if (!cancelled) {
          setGridLayoutApi(api);
        }
      })
      .catch((error) => {
        console.error("Failed to initialize GridLayout", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLayoutChange = useCallback((newLayout: any[]) => {
    setCurrentLayout(newLayout);
    onNativeEvent?.({
      type: "layoutChange",
      displayLabel: `${newLayout.length} items`,
      layout: newLayout,
    });
  }, [onNativeEvent]);

  const handleDragStop = useCallback((_layout: any[], _oldItem: any, newItem: any) => {
    onNativeEvent?.({
      type: "dragStop",
      displayLabel: `${newItem.i} → (${newItem.x},${newItem.y})`,
      item: newItem,
    });
  }, [onNativeEvent]);

  const handleResizeStop = useCallback((_layout: any[], _oldItem: any, newItem: any) => {
    onNativeEvent?.({
      type: "resizeStop",
      displayLabel: `${newItem.i} → ${newItem.w}×${newItem.h}`,
      item: newItem,
    });
  }, [onNativeEvent]);

  // Flatten children (unwrap XMLUI Items/template wrapper elements)
  const flatChildren = flattenChildren(children);
  const ResponsiveGridLayout = useMemo(
    () => (gridLayoutApi ? gridLayoutApi.WidthProvider(gridLayoutApi.Responsive) : null),
    [gridLayoutApi],
  );

  // react-grid-layout matches children to layout items by child.key.
  // Ensure each child div has a key and data-grid matching the layout.
  if (!ResponsiveGridLayout) {
    return (
      <div className={className}>
        {flatChildren.map((child, i) => {
          const layoutItem = currentLayout[i];
          const key = layoutItem?.i ?? `_gl_${i}`;
          return (
            <div key={key} style={{ overflow: "auto", marginBottom: resolvedGap }}>
              {child}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <ResponsiveGridLayout
      className={className}
      layouts={{ lg: currentLayout }}
      breakpoints={defaultBreakpoints}
      cols={defaultCols}
      rowHeight={rowHeight}
      margin={[resolvedGap, resolvedGap]}
      isDraggable={draggable}
      isResizable={resizable}
      compactType={compactType as any}
      onLayoutChange={handleLayoutChange}
      draggableHandle={draggableHandle || ""}
      draggableCancel={draggableCancel || ""}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
    >
      {flatChildren.map((child, i) => {
        const layoutItem = currentLayout[i];
        const key = layoutItem?.i ?? `_gl_${i}`;
        const dataGrid = layoutItem || { i: key, x: 0, y: Infinity, w: 6, h: 4 };
        return (
          <div key={key} data-grid={dataGrid} style={{ overflow: "auto" }}>
            {child}
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
});
