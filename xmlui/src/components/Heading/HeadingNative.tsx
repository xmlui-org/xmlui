import React, {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  useCallback,
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
import { Link } from "@remix-run/react";
import { useAppContext } from "../../components-core/AppContext";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

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
  showAnchor?: boolean;
  registerComponentApi?: RegisterComponentApiFn;
  [furtherProps: string]: any;
};

export const defaultProps: Pick<
  HeadingProps,
  "level" | "ellipses" | "omitFromToc" | "maxLines" | "preserveLinebreaks" | "showAnchor"
> = {
  level: "h1",
  ellipses: true,
  omitFromToc: false,
  maxLines: 0,
  preserveLinebreaks: false,
  showAnchor: false,
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
    showAnchor,
    registerComponentApi,
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
  const appContext = useAppContext();
  if (showAnchor === undefined) {
    showAnchor = appContext?.appGlobals?.showHeadingAnchors ?? false;
  }

  const ref = forwardedRef ? composeRefs(elementRef, forwardedRef) : elementRef;

  const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options,
      });
    }
  }, []);

  const hasOverflow = useCallback(() => {
    if (elementRef.current) {
      const element = elementRef.current;
      return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
    }
    return false;
  }, []);

  useEffect(() => {
    registerComponentApi?.({
      scrollIntoView,
      hasOverflow,
    });
  }, [registerComponentApi, scrollIntoView, hasOverflow]);

  useEffect(() => {
    if (elementRef.current) {
      let newAnchorId = elementRef.current.textContent
        ?.trim()
        ?.replace(/[^\w\s-]/g, "")
        ?.replace(/\s+/g, "-")
        ?.toLowerCase();
      
      // Ensure ID starts with a letter or underscore (not a digit)
      // This is required for querySelector to work without escaping
      if (newAnchorId && /^[0-9]/.test(newAnchorId)) {
        newAnchorId = "toc-" + newAnchorId;
      }
      
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
      {...furtherProps}
      ref={ref}
      id={uid}
      title={title}
      style={{ ...sx, ...style, ...getMaxLinesStyle(maxLines) }}
      className={classnames(styles.heading, styles[Element], className, {
        [styles.truncateOverflow]: maxLines > 0,
        [styles.preserveLinebreaks]: preserveLinebreaks,
        [styles.noEllipsis]: !ellipses,
      })}
    >
      {anchorId && (
        <span ref={anchorRef} id={anchorId} className={styles.anchorRef} data-anchor={true} />
      )}
      {children}
      {showAnchor && anchorId && (
        <Link
          to={`#${anchorId}`}
          aria-hidden="true"
          onClick={(event) => {
            // cmd/ctrl + click - open in new tab, don't prevent that
            if (tableOfContentsContext) {
              if (!event.ctrlKey && !event.metaKey && !event.metaKey) {
                event.preventDefault();
              }
              tableOfContentsContext.scrollToAnchor(anchorId, true);
            }
          }}
        >
          #
        </Link>
      )}
    </Element>
  );
});
