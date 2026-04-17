import { Fragment, type ReactNode, useMemo } from "react";
import { isPlainObject } from "lodash-es";

// =====================================================================================================================
// React Items component implementation

type Props = {
  items: any[];
  renderItem: (contextVars: any, key: number) => ReactNode;
  reverse?: boolean;
};

export const defaultProps: Pick<Props, "reverse"> = {
  reverse: false,
};

export function Items({ items, renderItem, reverse = defaultProps.reverse }: Props) {
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
