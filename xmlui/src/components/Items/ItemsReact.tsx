import { Fragment, type ReactNode, useMemo } from "react";
import { isPlainObject } from "lodash-es";
import { orderedKeys } from "../../components-core/utils/orderedKeys.ts";

// =====================================================================================================================
// React Items component implementation

type Props = {
  items: any[];
  renderItem: (contextVars: any, key: number) => ReactNode;
  reverse?: boolean;
};

import { defaultProps } from "./Items.defaults";

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
        return (
          <Fragment key={index}>
            {renderItem?.(
              {
                $item: item,
                $itemIndex: index,
                $isFirst: index === 0,
                $isLast: index === itemsToRender.length - 1,
              },
              index,
            )}
          </Fragment>
        );
      })}
    </>
  );
}
