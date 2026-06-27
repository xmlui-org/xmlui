import { forwardRef, memo, useEffect, useState, type HTMLAttributes } from "react";

import { defaultProps } from "./LiveRegion";
import styles from "./LiveRegion.module.scss";

export type LiveRegionPoliteness = "polite" | "assertive";

export type LiveRegionProps = HTMLAttributes<HTMLDivElement> & {
  message?: string;
  politeness?: LiveRegionPoliteness;
};

let announce: ((message: string, politeness?: LiveRegionPoliteness) => void) | undefined;

export function announceLiveRegion(
  message: unknown,
  politeness: LiveRegionPoliteness = defaultProps.politeness,
): void {
  if (typeof message !== "string" || message === "") {
    return;
  }
  announce?.(message, politeness === "assertive" ? "assertive" : "polite");
}

export const GlobalLiveRegion = memo(function GlobalLiveRegion() {
  const [state, setState] = useState<{ message: string; politeness: LiveRegionPoliteness }>({
    message: "",
    politeness: defaultProps.politeness,
  });

  useEffect(() => {
    announce = (message, politeness = defaultProps.politeness) =>
      setState({ message, politeness: politeness === "assertive" ? "assertive" : "polite" });
    return () => {
      announce = undefined;
    };
  }, []);

  return (
    <div
      aria-live={state.politeness}
      aria-atomic="true"
      aria-label={state.message}
      className={styles.liveRegion}
    />
  );
});

export const LiveRegion = memo(forwardRef<HTMLDivElement, LiveRegionProps>(function LiveRegion(
  {
    message = "",
    politeness = defaultProps.politeness,
    className,
    ...rest
  },
  ref,
) {
  const normalizedPoliteness = politeness === "assertive" ? "assertive" : "polite";
  return (
    <div
      {...rest}
      ref={ref}
      className={[styles.liveRegion, className].filter(Boolean).join(" ")}
      role={normalizedPoliteness === "assertive" ? "alert" : "status"}
      aria-live={normalizedPoliteness}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}));
