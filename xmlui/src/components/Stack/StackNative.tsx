import { type CSSProperties, type ReactNode, type Ref } from "react";
import { forwardRef } from "react";
import classnames from "@components-core/utils/classnames";
import styles from "./Stack.module.scss";
import { useContentAlignment } from "@components-core/component-hooks";
import { useOnMount } from "@components-core/utils/hooks";

export const DEFAULT_ORIENTATION = "vertical";

type Props = {
    children: ReactNode;
    orientation?: string;
    uid?: string;
    horizontalAlignment?: string;
    verticalAlignment?: string;
    layout?: CSSProperties;
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
      layout,
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
    const { horizontal, vertical } = useContentAlignment(orientation, horizontalAlignment, verticalAlignment);
    return (
      <div
        {...rest}
        onClick={onClick}
        ref={ref}
        style={layout}
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
  