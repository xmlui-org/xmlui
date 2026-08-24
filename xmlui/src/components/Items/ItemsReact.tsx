import { Fragment, type ReactNode, useMemo } from "react";
import { isPlainObject } from "lodash-es";
import { orderedKeys } from "../../components-core/utils/orderedKeys";

// =====================================================================================================================
// React Items component implementation

type Props = {
  items: any[];
  renderItem: (contextVars: any, key: string | number) => ReactNode;
  reverse?: boolean;
};

import { defaultProps } from "./Items.defaults";

function getItemKey(item: any, index: number): string | number {
  if (item && typeof item === "object") {
    const itemKey = item.$id ?? item.id ?? item.key;
    if (itemKey !== undefined && itemKey !== null) {
      return `${String(itemKey)}:${index}`;
    }
  }
  return index;
}

export function Items({ items, renderItem, reverse = defaultProps.reverse }: Props) {
  const itemsToRender = useMemo(() => {
    if (!items) {
      return [];
    }
    let normalizedItems = items;
    if (isPlainObject(items)) {
      normalizedItems = orderedKeys(items).map((key) => items[key as keyof typeof items]);
    }
    return reverse ? [...normalizedItems].reverse() : normalizedItems;
  }, [items, reverse]);

  if (!itemsToRender || !Array.isArray(itemsToRender)) {
    return null;
  }

  return (
    <>
      {itemsToRender.map((item, index) => {
        const key = getItemKey(item, index);
        return (
          <Fragment key={key}>
            {renderItem?.(
              {
                $item: item,
                $itemIndex: index,
                $isFirst: index === 0,
                $isLast: index === itemsToRender.length - 1,
              },
              key,
            )}
          </Fragment>
        );
      })}
    </>
  );
}
