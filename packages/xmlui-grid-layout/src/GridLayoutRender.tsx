import React, { useRef, useState, useEffect, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

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

export function GridLayoutRender({
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
  onNativeEvent?: (event: any) => void;
  children?: React.ReactNode;
}) {
  const defaultBreakpoints = breakpoints || { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const defaultCols = cols || { lg: columns, md: columns, sm: Math.max(1, columns - 4), xs: Math.max(1, columns - 6), xxs: Math.max(1, columns - 8) };

  const [resolvedGap, setResolvedGap] = useState(() => resolveCssLength(gap, 16));
  const [currentLayout, setCurrentLayout] = useState<any[]>(layout || []);

  useEffect(() => {
    setResolvedGap(resolveCssLength(gap, 16));
  }, [gap]);

  useEffect(() => {
    if (layout) setCurrentLayout(layout);
  }, [layout]);

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

  // Map children to grid items using layout
  const childArray = React.Children.toArray(children);

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
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
    >
      {childArray.map((child, i) => {
        const key = currentLayout[i]?.i || String(i);
        return (
          <div key={key} style={{ overflow: "auto" }}>
            {child}
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}
