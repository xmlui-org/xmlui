import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import classnames from "classnames";
import { RenderPropSticky } from "react-sticky-el";
import styles from "./StickyBox.module.scss";
import { useRealBackground, useScrollParent } from "../../components-core/utils/hooks";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

// --- NOTE: React.StrictMode produces error logs using this component. Deployed apps are okay.
// See here: https://github.com/gm0t/react-sticky-el/issues/82

// =====================================================================================================================
// React StickyBox component implementation

export const defaultProps = {
  to: "top" as const,
};

const HIDDEN_STYLE = { display: "none" } as const;

type Props = React.HTMLAttributes<HTMLElement> & {
  classes?: Record<string, string>;
  to: "top" | "bottom";
};

export const StickyBox = memo(function StickyBox({ children, style, to = defaultProps.to, className, classes, ...rest }: Props) {
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
    }
  }, [scrollParent, wrapper]);
  const wrapperClassName = classnames(styles.wrapper, classes?.[COMPONENT_PART_KEY], className);
  const stickyStyles = useMemo(
    () => ({ backgroundColor: realBackground, ...style }),
    [realBackground, style],
  );
  const stickyClassName = "";
  return (
    <>
      {!!scrollParent && (
        <RenderPropSticky
          mode={to}
          onFixedToggle={setStuck}
          scrollElement={scrollParent}
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
        style={HIDDEN_STYLE}
        ref={sentinelRef}
        className={to === "top" ? styles.sentinel : ""}
      />
    </>
  );
});
