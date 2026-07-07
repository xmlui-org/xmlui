import { Fragment, type ReactNode, useMemo } from "react";

import { defaultProps } from "./Items.defaults";

type ItemsProps = {
  items: unknown;
  reverse?: boolean;
  renderItem: (contextVars: Record<string, unknown>, key: number) => ReactNode;
};

export function ItemsNative({
  items,
  renderItem,
  reverse = defaultProps.reverse,
}: ItemsProps) {
  const itemsToRender = useMemo(() => {
    const normalizedItems = normalizeItems(items);
    return reverse ? [...normalizedItems].reverse() : normalizedItems;
  }, [items, reverse]);

  if (!Array.isArray(itemsToRender)) {
    return null;
  }

  return (
    <>
      {itemsToRender.map((item, index) => (
        <Fragment key={index}>
          {renderItem(
            {
              $item: item,
              $itemIndex: index,
              $isFirst: index === 0,
              $isLast: index === itemsToRender.length - 1,
            },
            index,
          )}
        </Fragment>
      ))}
    </>
  );
}

export { ItemsNative as Items };

function normalizeItems(items: unknown): unknown[] {
  if (!items) {
    return [];
  }
  if (Array.isArray(items)) {
    return items;
  }
  if (isPlainObject(items)) {
    return orderedKeys(items).map((key) => items[key]);
  }
  return [];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function orderedKeys(value: Record<string, unknown>): string[] {
  return Object.keys(value).sort((left, right) => left.localeCompare(right));
}
