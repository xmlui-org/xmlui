import React, { memo, useEffect, useMemo, useState } from "react";
import classnames from "classnames";
import { RenderPropSticky } from "react-sticky-el";
import styles from "./StickyBox.module.scss";
import { useRealBackground, useScrollParent } from "../../components-core/utils/hooks";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

// --- NOTE: React.StrictMode produces error logs using this component. Deployed apps are okay.
// See here: https://github.com/gm0t/react-sticky-el/issues/82

// =====================================================================================================================
// React StickyBox component implementation

import { defaultProps } from "./StickyBox.defaults";

const HIDDEN_STYLE = { display: "none" } as const;

type Props = React.HTMLAttributes<HTMLElement> & {
  classes?: Record<string, string>;
  to: "top" | "bottom";
};

export const StickyBox = memo(function StickyBox({ children, style, to = defaultProps.to, className, classes, ...rest }: Props) {
  // Callback ref, not useRef: `useScrollParent` resolves the scroll parent in an
  // effect keyed on the node it is handed, and a ref mutation does not re-render.
  // Seeded from `sentinelRef.current` this hook saw `null` on first render and
  // never re-ran, so StickyBox resolved its scroll parent only when something
  // else happened to re-render it. Same pattern as `wrapper` just below.
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);
  const [wrapper, setWrapper] = useState(null);
  const [stuck, setStuck] = useState(false);
  const scrollParent = useScrollParent(sentinel);
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
        ref={setSentinel}
        className={to === "top" ? styles.sentinel : ""}
      />
    </>
  );
});
