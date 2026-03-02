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
import { StackScroller, type ScrollStyle } from "./StackScroller";

import { useContentAlignment } from "../../components-core/component-hooks";
import { useOnMount } from "../../components-core/utils/hooks";

export const DEFAULT_ORIENTATION = "vertical";

export const defaultProps = {
  orientation: DEFAULT_ORIENTATION,
  reverse: false,
  desktopOnly: false,
  hoverContainer: false,
  visibleOnHover: false,
  scrollStyle: "normal" as ScrollStyle,
  showScrollerFade: true,
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
  onContextMenu?: any;
  onMount?: any;
  desktopOnly?: boolean;
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
    onContextMenu,
    onMount,
    desktopOnly = defaultProps.desktopOnly,
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
      // For Radix scroll modes (overlay / whenMouseOver / whenScrolling), containerRef points to
      // ScrollArea.Root. The actual scrollable element is the Radix Viewport inside it.
      // For "normal" mode containerRef IS the scrollable div, so the fallback to containerRef works.
      const getScrollTarget = (): HTMLElement | null => {
        if (!containerRef.current) return null;
        return (
          containerRef.current.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]') ??
          containerRef.current
        );
      };
      registerComponentApi({
        scrollToTop: (behavior: ScrollBehavior = "instant") => {
          const el = getScrollTarget();
          el?.scrollTo({ top: 0, behavior });
        },
        scrollToBottom: (behavior: ScrollBehavior = "instant") => {
          const el = getScrollTarget();
          if (el) el.scrollTo({ top: el.scrollHeight, behavior });
        },
        scrollToStart: (behavior: ScrollBehavior = "instant") => {
          const el = getScrollTarget();
          el?.scrollTo({ left: 0, behavior });
        },
        scrollToEnd: (behavior: ScrollBehavior = "instant") => {
          const el = getScrollTarget();
          if (el) el.scrollTo({ left: el.scrollWidth, behavior });
        },
      });
    }
  }, [registerComponentApi]);

  return (
    <StackScroller
      {...rest}
      onClick={onClick}
      onContextMenu={onContextMenu}
      ref={containerRef}
      style={style}
      scrollStyle={scrollStyle}
      showScrollerFade={showScrollerFade}
      className={classnames(
        className,
        styles.base,
        {
          [styles.desktopOnly]: desktopOnly,
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
    </StackScroller>
  );
});
