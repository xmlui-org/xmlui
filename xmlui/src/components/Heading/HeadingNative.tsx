import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./Heading.module.scss";

import { getMaxLinesStyle } from "../../components-core/utils/css-utils";
import { TableOfContentsContext } from "../../components-core/TableOfContentsContext";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import type { HeadingLevel } from "./abstractions";

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

export const defaultProps: Pick<HeadingProps, "level" | "ellipses" | "omitFromToc" | "maxLines"> = {
  level: "h1",
  ellipses: true,
  omitFromToc: false,
  maxLines: 0,
};

export const Heading = forwardRef(function Heading(
  {
    uid,
    level = defaultProps.level,
    children,
    sx,
    style,
    title,
    maxLines = defaultProps.maxLines,
    preserveLinebreaks,
    ellipses = defaultProps.ellipses,
    className,
    omitFromToc = defaultProps.omitFromToc,
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

  const ref = forwardedRef ? composeRefs(elementRef, forwardedRef) : elementRef;

  useEffect(() => {
    if (elementRef.current) {
      const newAnchorId = elementRef.current.textContent
        ?.trim()
        ?.replace(/[^\w\s-]/g, "")
        ?.replace(/\s+/g, "-")
        ?.toLowerCase();
      setAnchorId(newAnchorId || null);
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (elementRef.current && anchorId && !omitFromToc) {
      return registerHeading?.({
        id: anchorId,
        level: parseInt(level.replace("h", "")),
        text: elementRef.current.textContent!.trim().replace(/#$/, ""), // Remove trailing #
        anchor: anchorRef.current,
      });
    }
  }, [anchorId, registerHeading, level, omitFromToc]);

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
      {anchorId && (
        <span ref={anchorRef} id={anchorId} className={styles.anchorRef} data-anchor={true} />
      )}
      {children}
    </Element>
  );
});
