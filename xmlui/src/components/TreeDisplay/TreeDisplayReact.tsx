import { memo, type CSSProperties, type MouseEvent } from "react";

import styles from "./TreeDisplay.module.scss";

export type TreeDisplayProps = {
  content?: string;
  itemHeight?: number;
  className?: string;
  style?: CSSProperties;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void | Promise<void>;
  "data-testid"?: string;
};

export const TreeDisplayNative = memo(function TreeDisplayNative({
  content = "",
  itemHeight,
  className,
  style,
  onContextMenu,
  "data-testid": dataTestId,
  ...rest
}: TreeDisplayProps) {
  return (
    <div {...rest} className={[styles.root, className].filter(Boolean).join(" ")} style={style} data-testid={dataTestId} role="tree" onContextMenu={onContextMenu}>
      {content.split(/\r?\n/).filter((line) => line.trim().length > 0).map((line, index) => (
        <div key={`${line}-${index}`} className={styles.item} style={{ minHeight: itemHeight ? `${itemHeight}px` : undefined }} role="treeitem">
          {line}
        </div>
      ))}
    </div>
  );
});
