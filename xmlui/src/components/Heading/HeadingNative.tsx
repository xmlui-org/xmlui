import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./Heading.module.scss";

import { getMaxLinesStyle } from "../../components-core/utils/css-utils";
import { TableOfContentsContext } from "../../components-core/TableOfContentsContext";

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
  [furtherProps: string]: any;
};

export const defaultProps: Pick<HeadingProps, "level" | "ellipses" | "omitFromToc"> = {
  level: "h1",
  ellipses: true,
  omitFromToc: false,
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
    omitFromToc = false,
    ...furtherProps
  }: HeadingProps,
  forwardedRef: ForwardedRef<HTMLHeadingElement>,
) {
  const Element = level?.toLowerCase() as HeadingLevel;
  const elementRef = useRef<HTMLHeadingElement>(null);
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const tableOfContentsContext = useContext(TableOfContentsContext);
  const registerHeading = tableOfContentsContext?.registerHeading;
  const observeIntersection = tableOfContentsContext?.hasTableOfContents;

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

  useLayoutEffect(() => {
    if (observeIntersection && elementRef.current && anchorId && !omitFromToc) {
      return registerHeading?.({
        id: anchorId,
        level: parseInt(level.replace("h", "")),
        text: elementRef.current.textContent!.trim(),
        anchor: anchorRef.current,
      });
    }
  }, [anchorId, observeIntersection, registerHeading, level, omitFromToc]);

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
      {...furtherProps}
    >
      {anchorId && observeIntersection && (
        <span ref={anchorRef} id={anchorId} style={{ width: 0, height: 0 }} data-anchor={true} />
      )}
      {children}
    </Element>
  );
});
