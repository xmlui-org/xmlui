import type { CSSProperties, ReactNode } from "react";

import { defaultProps } from "./TileGrid.defaults";
import styles from "./TileGrid.module.scss";

export type TileGridItem = {
  key: string | number;
  selected?: boolean;
  content: ReactNode;
  onClick?: () => void | Promise<void>;
  onDoubleClick?: () => void | Promise<void>;
  onContextMenu?: (event: React.MouseEvent) => void | Promise<void>;
};

export type TileGridProps = {
  className?: string;
  style?: CSSProperties;
  itemWidth?: string;
  itemHeight?: string;
  gap?: string;
  stretchItems?: boolean;
  loading?: boolean;
  items?: TileGridItem[];
};

export function TileGridNative({
  className,
  style,
  itemWidth = defaultProps.itemWidth,
  itemHeight = defaultProps.itemHeight,
  gap = defaultProps.gap,
  stretchItems = defaultProps.stretchItems,
  loading = defaultProps.loading,
  items = [],
  ...rest
}: TileGridProps) {
  return (
    <div
      {...rest}
      className={cx(styles.tileGrid, !stretchItems ? styles.fixedTiles : undefined, loading ? styles.loading : undefined, className)}
      style={{
        ...style,
        "--xmlui-itemWidth-TileGrid": itemWidth,
        "--xmlui-itemHeight-TileGrid": itemHeight,
        "--xmlui-gap-TileGrid": gap,
      } as CSSProperties}
    >
      {loading ? null : items.map((item) => (
        <div
          key={item.key}
          className={cx(styles.tile, item.selected ? styles.selected : undefined)}
          tabIndex={0}
          onClick={() => void item.onClick?.()}
          onDoubleClick={() => void item.onDoubleClick?.()}
          onContextMenu={(event) => void item.onContextMenu?.(event)}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
