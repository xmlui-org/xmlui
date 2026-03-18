import { type ReactElement, type ReactNode, useCallback, forwardRef } from "react";
import { VirtuosoMasonry, type ItemContent } from "@virtuoso.dev/masonry";

export type MasonryItemProps = {
  index: number;
  data: unknown;
};

export type MasonryProps = {
  id?: string;
  className?: string;
  items?: unknown[];
  columnCount?: number;
  height?: string;
  useWindowScroll?: boolean;
  initialItemCount?: number;
  itemRenderer?: (props: MasonryItemProps) => ReactNode;
};

export const defaultProps = {
  columnCount: 3,
  height: "400px",
};

export const MasonryNative = forwardRef<Record<string, never>, MasonryProps>(
  function MasonryNative(
    {
      id,
      className,
      items,
      columnCount = defaultProps.columnCount,
      height = defaultProps.height,
      useWindowScroll,
      initialItemCount,
      itemRenderer,
    },
    ref,
  ) {
    const ItemContent = useCallback<ItemContent<unknown>>(
      ({ data, index }) => (itemRenderer?.({ data, index }) ?? null) as ReactElement,
      [itemRenderer],
    );

    return (
      <VirtuosoMasonry
        ref={ref}
        id={id}
        className={className}
        data={items ?? []}
        columnCount={columnCount}
        ItemContent={ItemContent}
        style={useWindowScroll ? undefined : { height }}
        useWindowScroll={useWindowScroll}
        initialItemCount={initialItemCount}
      />
    );
  },
);
