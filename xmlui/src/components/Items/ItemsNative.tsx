import { type ReactNode, useMemo } from "react";
import { isPlainObject } from "lodash-es";

// =====================================================================================================================
// React Items component implementation

export function Items({
  items,
  renderItem,
  reverse = false,
}: {
  reverse?: boolean;
  items: any[];
  renderItem: (contextVars: any, key: number) => ReactNode;
}) {
  const itemsToRender = useMemo(() => {
    if (!items) {
      return [];
    }
    let normalizedItems = items;
    if (isPlainObject(items)) {
      normalizedItems = Object.values(items);
    }
    return reverse ? [...normalizedItems].reverse() : normalizedItems;
  }, [items, reverse]);

  if (!itemsToRender) {
    return null;
  }
  return (
    <>
      {itemsToRender.map((item, index) =>
        renderItem(
          {
            $item: item,
            $itemIndex: index,
            $isFirst: index === 0,
            $isLast: index === itemsToRender.length - 1,
          },
          index,
        ),
      )}
    </>
  );
}
