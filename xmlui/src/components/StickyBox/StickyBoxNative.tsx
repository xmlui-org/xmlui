import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import classnames from "classnames";
import Sticky from "react-sticky-el";

import styles from "./StickyBox.module.scss";
import { useRealBackground, useScrollParent } from "../../components-core/utils/hooks";

// =====================================================================================================================
// React StickyBox component implementation

type Props = {
  children: ReactNode;
  uid?: string;
  layout?: CSSProperties;
  to: "top" | "bottom";
};

export function StickyBox({ children, uid, layout, to = "top" }: Props) {
  const sentinelRef = useRef(null);
  const [wrapper, setWrapper] = useState(null);
  const [stuck, setStuck] = useState(false);
  const scrollParent = useScrollParent(sentinelRef.current);
  const realBackground = useRealBackground(scrollParent);
  useEffect(() => {
    if (wrapper) {
      console.log(wrapper.innerHeight);
      document.documentElement.style.setProperty(
        "--xmlui-scroll-margin-top",
        wrapper.clientHeight + "px",
      );
      // scrollParent.setAttribute("data-xmlui-scroll-padding", true);
    }
  }, [scrollParent, wrapper]);
  return (
    <>
      {scrollParent && (
        <Sticky
          scrollElement={scrollParent}
          wrapperClassName={classnames(styles.wrapper)}
          mode={to}
          onFixedToggle={setStuck}
          stickyStyle={{
            backgroundColor: realBackground,
            ...layout,
          }}
        >
          <div ref={setWrapper}>{children}</div>
        </Sticky>
      )}
      <div style={{ display: "none" }} ref={sentinelRef} className={to === "top" ? styles.sentinel : ""} />
    </>
  );
}
