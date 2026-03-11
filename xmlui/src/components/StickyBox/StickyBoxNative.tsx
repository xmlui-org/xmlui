import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import classnames from "classnames";
import { RenderPropSticky } from "react-sticky-el";
import styles from "./StickyBox.module.scss";
import { useRealBackground, useScrollParent } from "../../components-core/utils/hooks";

// --- NOTE: React.StrictMode produces error logs using this component. Deployed apps are okay.
// See here: https://github.com/gm0t/react-sticky-el/issues/82

// =====================================================================================================================
// React StickyBox component implementation

export const defaultProps = {
  to: "top" as const,
};

type Props = {
  children: ReactNode;
  uid?: string;
  style?: CSSProperties;
  className?: string;
  to: "top" | "bottom";
};

export function StickyBox({ children, uid, style, to = defaultProps.to, className }: Props) {
  const sentinelRef = useRef(null);
  const [wrapper, setWrapper] = useState(null);
  const [stuck, setStuck] = useState(false);
  const scrollParent = useScrollParent(sentinelRef.current);
  const realBackground = useRealBackground(scrollParent);
  useEffect(() => {
    if (wrapper) {
      document.documentElement.style.setProperty(
        "--xmlui-scroll-margin-top",
        wrapper.clientHeight + "px",
      );
      // scrollParent.setAttribute("data-xmlui-scroll-padding", true);
    }
  }, [scrollParent, wrapper]);
  const wrapperClassName = classnames(styles.wrapper, className);
  const stickyStyles = {
    backgroundColor: realBackground,
    ...style,
  };
  const stickyClassName = "";
  return (
    <>
      {!!scrollParent && (
        <RenderPropSticky
          mode={to}
          onFixedToggle={setStuck}
          // hideOnBoundaryHit={hideOnBoundaryHit}
          // offsetTransforms={offsetTransforms}
          // disabled={disabled}
          // boundaryElement={boundaryElement}
          scrollElement={scrollParent}
          // bottomOffset={bottomOffset}
          // topOffset={topOffset}
          // positionRecheckInterval={positionRecheckInterval}
        >
          {({ isFixed, wrapperStyles, wrapperRef, holderStyles, holderRef }) => (
            <div ref={holderRef} style={holderStyles}>
              <div
                className={`${wrapperClassName} ${isFixed ? stickyClassName : ""}`}
                style={isFixed ? { ...wrapperStyles, ...stickyStyles } : wrapperStyles}
                ref={wrapperRef}
              >
                <div ref={setWrapper}>{children}</div>
              </div>
            </div>
          )}
        </RenderPropSticky>
      )}
      <div
        style={{ display: "none" }}
        ref={sentinelRef}
        className={to === "top" ? styles.sentinel : ""}
      />
    </>
  );
}
