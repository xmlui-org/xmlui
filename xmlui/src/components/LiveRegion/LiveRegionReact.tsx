import { forwardRef, memo, useEffect, useState } from "react";

export type LiveRegionProps = React.HTMLAttributes<HTMLDivElement> & {
  message?: string;
  politeness?: "polite" | "assertive";
};

export const defaultProps = {
  politeness: "polite" as const,
};

const hiddenStyle: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

let announce: ((message: string, politeness?: "polite" | "assertive") => void) | undefined;

export function announceLiveRegion(message: unknown, politeness: "polite" | "assertive" = "polite") {
  if (typeof message !== "string" || !message) return;
  announce?.(message, politeness);
}

export const GlobalLiveRegion = memo(function GlobalLiveRegion() {
  const [state, setState] = useState<{ message: string; politeness: "polite" | "assertive" }>({
    message: "",
    politeness: "polite",
  });
  useEffect(() => {
    announce = (message, politeness = "polite") => setState({ message, politeness });
    return () => {
      announce = undefined;
    };
  }, []);
  return (
    <div aria-live={state.politeness} aria-atomic="true" aria-label={state.message} style={hiddenStyle} />
  );
});

export const LiveRegion = memo(forwardRef<HTMLDivElement, LiveRegionProps>(function LiveRegion(
  { message = "", politeness = defaultProps.politeness, style, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      role={politeness === "assertive" ? "alert" : "status"}
      aria-live={politeness}
      aria-atomic="true"
      style={{ ...hiddenStyle, ...style }}
    >
      {message}
    </div>
  );
}));
