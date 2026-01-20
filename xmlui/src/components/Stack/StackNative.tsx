import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import classnames from "classnames";

import styles from "./Stack.module.scss";
import { Scroller, type ScrollStyle } from "../ScrollViewer/Scroller";

import { useContentAlignment } from "../../components-core/component-hooks";
import { useOnMount } from "../../components-core/utils/hooks";

export const DEFAULT_ORIENTATION = "vertical";

export const defaultProps = {
  orientation: DEFAULT_ORIENTATION,
  reverse: false,
  hoverContainer: false,
  visibleOnHover: false,
  scrollStyle: "normal" as ScrollStyle,
  showScrollerFade: false,
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
  scrollStyle?: ScrollStyle;
  showScrollerFade?: boolean;
  onClick?: any;
  onMount?: any;
  registerComponentApi?: (api: any) => void;
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
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    onClick,
    onMount,
    className,
    registerComponentApi,
    ...rest
  }: Props,
  ref: Ref<any>,
) {
  useOnMount(onMount);
  const containerRef = useRef<HTMLDivElement>(null);

  const { horizontal, vertical } = useContentAlignment(
    orientation,
    horizontalAlignment,
    verticalAlignment,
  );

  // Expose ref to parent
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  // Register API methods
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
        scrollToTop: (behavior: ScrollBehavior = "instant") => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: 0,
              behavior,
            });
          }
        },
        scrollToBottom: (behavior: ScrollBehavior = "instant") => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior,
            });
          }
        },
        scrollToStart: (behavior: ScrollBehavior = "instant") => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              left: 0,
              behavior,
            });
          }
        },
        scrollToEnd: (behavior: ScrollBehavior = "instant") => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              left: containerRef.current.scrollWidth,
              behavior,
            });
          }
        },
      });
    }
  }, [registerComponentApi]);

  return (
    <Scroller
      {...rest}
      onClick={onClick}
      ref={containerRef}
      style={style}
      scrollStyle={scrollStyle}
      showScrollerFade={showScrollerFade}
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
    </Scroller>
  );
});
