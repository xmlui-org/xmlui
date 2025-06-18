import { type CSSProperties, forwardRef, type ReactNode, type Ref } from "react";
import classnames from "classnames";

import styles from "./Stack.module.scss";

import { useContentAlignment } from "../../components-core/component-hooks";
import { useOnMount } from "../../components-core/utils/hooks";

export const DEFAULT_ORIENTATION = "vertical";

export const defaultProps = {
  orientation: DEFAULT_ORIENTATION,
  reverse: false,
  hoverContainer: false,
  visibleOnHover: false,
};

type Props = {
  children: ReactNode;
  orientation?: string;
  uid?: string;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  style?: CSSProperties;
  className?: string;
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
    orientation = defaultProps.orientation,
    horizontalAlignment,
    verticalAlignment,
    style,
    reverse = defaultProps.reverse,
    hoverContainer = defaultProps.hoverContainer,
    visibleOnHover = defaultProps.visibleOnHover,
    onClick,
    onMount,
    className,
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
        className,
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
