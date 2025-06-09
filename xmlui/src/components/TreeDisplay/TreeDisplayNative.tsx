import { type CSSProperties, type ForwardedRef, forwardRef, type ReactNode } from "react";

import styles from "./TreeDisplay.module.scss";

type Props = {
  style?: CSSProperties;
  children?: ReactNode;
  content?: string;
};

export const defaultProps: Pick<Props, "content"> = {
  content: "",
};

export const TreeDisplay = forwardRef(function TreeDisplay(
  {
    style,
    children,
    content = defaultProps.content,
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const displayContent = content || children;
  
  return (
    <div
      className={styles.treeDisplay}
      style={style}
      ref={forwardedRef}
    >
      <div className={styles.content}>
        {displayContent}
      </div>
    </div>
  );
});
