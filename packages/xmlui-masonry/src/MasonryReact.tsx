import React, { memo, forwardRef, useCallback, useRef, useState, useEffect, type HTMLAttributes, type ForwardedRef, type Ref } from "react";

function useComposedRefs<T>(...refs: Ref<T>[]): (node: T | null) => void {
  return useCallback(
    (node: T | null) => {
      for (const ref of refs) {
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}

function resolveToken(value: string): string {
  return value.startsWith("$") ? `var(--xmlui-${value.substring(1)})` : value;
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

type Props = HTMLAttributes<HTMLDivElement> & {
  columns?: number;
  gap?: string;
  columnGap?: string;
  rowGap?: string;
  minColumnWidth?: string;
};

export const MasonryReact = memo(
  forwardRef(function MasonryReact(
    {
      columns = 3,
      gap = "16px",
      columnGap,
      rowGap,
      minColumnWidth = "250px",
      className,
      children,
      ...rest
    }: Props,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    const effectiveColumnGap = resolveToken(columnGap ?? gap);
    const effectiveRowGap = resolveToken(rowGap ?? gap);
    const innerRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, innerRef);
    const [actualColumns, setActualColumns] = useState(columns);

    useEffect(() => {
      const el = innerRef.current;
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
        {...rest}
        ref={composedRef}
        className={className}
        style={{
          columnCount: actualColumns,
          columnGap: effectiveColumnGap,
        }}
      >
        {flattenChildren(children).map((child, i) => (
          <div key={i} style={{ breakInside: "avoid", marginBottom: effectiveRowGap }}>
            {child}
          </div>
        ))}
      </div>
    );
  }),
);
