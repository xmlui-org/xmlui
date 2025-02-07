import { CSSProperties, ForwardedRef, forwardRef, ReactNode } from "react";
import { useContext, useEffect, useRef, useState } from "react";
import styles from "./Heading.module.scss";
import classnames from "classnames";
import { getMaxLinesStyle } from "../../components-core/utils/css-utils";
import { TableOfContentsContext } from "../../components-core/TableOfContentsContext";
import { composeRefs } from "@radix-ui/react-compose-refs";

const HeadingLevelKeys = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export type HeadingLevel = (typeof HeadingLevelKeys)[number];

export type HeadingProps = {
  uid?: string;
  level?: HeadingLevel;
  children: ReactNode;
  sx?: CSSProperties;
  style?: CSSProperties;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  title?: string;
  className?: string;
};

export const Heading = forwardRef(function Heading(
  {
    uid,
    level = "h1",
    children,
    sx,
    style,
    title,
    maxLines = 0,
    preserveLinebreaks,
    ellipses = true,
    className,
  }: HeadingProps,
  forwardedRef: ForwardedRef<HTMLHeadingElement>,
) {
  const Element = level?.toLowerCase() as HeadingLevel;
  const elementRef = useRef<HTMLHeadingElement>(null);
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const tableOfContentsContext = useContext(TableOfContentsContext);
  const registerHeading = tableOfContentsContext?.registerHeading;
  const observeIntersection = tableOfContentsContext?.observeIntersection;

  const ref = forwardedRef ? composeRefs(elementRef, forwardedRef) : elementRef;

  useEffect(() => {
    if (observeIntersection && elementRef.current) {
      const newAnchorId = elementRef.current.textContent
        ?.trim()
        ?.replace(/[^\w\s-]/g, "")
        ?.replace(/\s+/g, "-")
        ?.toLowerCase();
      setAnchorId(newAnchorId || null);
    }
  }, [observeIntersection]);

  useEffect(() => {
    if (observeIntersection && elementRef.current && anchorId) {
      return registerHeading?.({
        id: anchorId,
        level: parseInt(level.replace("h", "")),
        text: elementRef.current.textContent!.trim(),
        anchor: anchorRef.current,
      });
    }
  }, [anchorId, observeIntersection, registerHeading, level]);

  return (
    <Element
      ref={ref}
      id={uid}
      title={title}
      style={{ ...sx, ...style, ...getMaxLinesStyle(maxLines) }}
      className={classnames(styles.heading, styles[Element], className || "", {
        [styles.truncateOverflow]: maxLines > 0,
        [styles.preserveLinebreaks]: preserveLinebreaks,
        [styles.noEllipsis]: !ellipses,
      })}
    >
      {anchorId && observeIntersection && (
        <span ref={anchorRef} id={anchorId} style={{ width: 0, height: 0 }} />
      )}
      {children}
    </Element>
  );
});
