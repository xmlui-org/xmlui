import { type CSSProperties, type ReactNode, type Ref } from "react";
import { forwardRef } from "react";
import classnames from "classnames";

import styles from "./Stack.module.scss";

import { useContentAlignment } from "../../components-core/component-hooks";
import { useOnMount } from "../../components-core/utils/hooks";

export const DEFAULT_ORIENTATION = "vertical";

type Props = {
  children: ReactNode;
  orientation?: string;
  uid?: string;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  style?: CSSProperties;
  reverse?: boolean;
  hoverContainer?: boolean;
  visibleOnHover?: boolean;
  onClick?: any;
  onMount?: any;
};

// =====================================================================================================================
// Stack React component

export const Stack = forwardRef(function Stack(
  {
    uid,
    children,
    orientation = DEFAULT_ORIENTATION,
    horizontalAlignment,
    verticalAlignment,
    style,
    reverse,
    hoverContainer,
    visibleOnHover,
    onClick,
    onMount,
    ...rest
  }: Props,
  ref: Ref<any>,
) {
  useOnMount(onMount);
  const { horizontal, vertical } = useContentAlignment(
    orientation,
    horizontalAlignment,
    verticalAlignment,
  );
  return (
    <div
      {...rest}
      onClick={onClick}
      ref={ref}
      style={style}
      className={classnames(
        styles.base,
        {
          [styles.vertical]: orientation === "vertical",
          [styles.horizontal]: orientation === "horizontal",
          [styles.reverse]: reverse,
          [styles.hoverContainer]: hoverContainer,
          "display-on-hover": visibleOnHover,
          [styles.handlesClick]: !!onClick,
        },
        horizontal ?? "",
        vertical ?? "",
      )}
    >
      {children}
    </div>
  );
});
