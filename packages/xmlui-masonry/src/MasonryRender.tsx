import React, { useRef, useState, useEffect } from "react";

function resolveToken(value: string): string {
  return value.startsWith("$") ? `var(--xmlui-${value.substring(1)})` : value;
}

function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const flat: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.props.children) {
      // If this is a wrapper (like Items), flatten its children too
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

export function MasonryRender({
  columns = 3,
  gap = "16px",
  columnGap,
  rowGap,
  minColumnWidth = "250px",
  className,
  children,
}: {
  columns?: number;
  gap?: string;
  columnGap?: string;
  rowGap?: string;
  minColumnWidth?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const effectiveColumnGap = resolveToken(columnGap ?? gap);
  const effectiveRowGap = resolveToken(rowGap ?? gap);
  const containerRef = useRef<HTMLDivElement>(null);
  const [actualColumns, setActualColumns] = useState(columns);

  // Auto-reduce columns based on container width and minColumnWidth
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const minPx = parseFloat(minColumnWidth) || 250;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      const fits = Math.max(1, Math.floor(width / minPx));
      setActualColumns(Math.min(columns, fits));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [columns, minColumnWidth]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        columnCount: actualColumns,
        columnGap: effectiveColumnGap,
      }}
    >
      {flattenChildren(children).map((child, i) => (
        <div style={{ breakInside: "avoid", marginBottom: effectiveRowGap }}>
          {child}
        </div>
      ))}
    </div>
  );
}
