import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import scrollIntoView from "scroll-into-view-if-needed";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./TableOfContents.module.scss";
import { useTableOfContents } from "../../components-core/TableOfContentsContext";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import { useIndicatorPosition } from "./useIndicatorPosition";

// Scroll options for smooth/auto scrolling behavior
const SCROLL_OPTIONS = {
  block: "center" as const,
  inline: "center" as const,
  scrollMode: "always" as const,
} as const;

type Props = {
  style?: CSSProperties;
  className?: string;
  smoothScrolling?: boolean;
  maxHeadingLevel?: number;
  omitH1?: boolean;
  onContextMenu?: any;
};

export const defaultProps = {
  smoothScrolling: false,
  maxHeadingLevel: 6,
  omitH1: false,
};

export const TableOfContents = forwardRef(function TableOfContents(
  {
    style,
    smoothScrolling = defaultProps.smoothScrolling,
    maxHeadingLevel = defaultProps.maxHeadingLevel,
    omitH1 = defaultProps.omitH1,
    className,
    onContextMenu,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const tocRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const {
    headings,
    scrollToAnchor,
    subscribeToActiveAnchorChange,
    activeAnchorId: initialActiveAnchorId,
  } = useTableOfContents();
  const [activeAnchorId, setActiveId] = useState(initialActiveAnchorId);

  const ref = forwardedRef ? composeRefs(tocRef, forwardedRef) : tocRef;

  const filteredHeadings = useMemo(
    () =>
      headings.filter(
        (heading) =>
          heading.level <= maxHeadingLevel && (!omitH1 || heading.level !== 1),
      ),
    [headings, maxHeadingLevel, omitH1],
  );

  useIsomorphicLayoutEffect(() => {
    return subscribeToActiveAnchorChange((id) => {
      const foundHeading = filteredHeadings.find((heading) => heading.id === id);
      if (foundHeading) {
        setActiveId(id);
      }
    });
  }, [filteredHeadings, subscribeToActiveAnchorChange]);

  const handleLinkClick = useCallback(
    (anchorId: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Allow cmd/ctrl+click to open in new tab via browser default behavior
      const shouldAllowDefault = event.ctrlKey || event.metaKey;

      if (!shouldAllowDefault) {
        event.preventDefault();
        scrollToAnchor(anchorId, smoothScrolling);
      }
    },
    [scrollToAnchor, smoothScrolling],
  );

  useEffect(() => {
    if (!activeAnchorId || !tocRef.current) return;

    const activeAnchor = tocRef.current.querySelector(
      `[id="${CSS.escape(activeAnchorId)}"]`,
    );
    if (!activeAnchor) return;

    scrollIntoView(activeAnchor, {
      ...SCROLL_OPTIONS,
      behavior: smoothScrolling ? "smooth" : "auto",
      boundary: tocRef.current,
    });
  }, [activeAnchorId, smoothScrolling]);

  useIndicatorPosition(activeAnchorId, tocRef, indicatorRef, styles.active);

  return (
    <nav
      {...rest}
      aria-label="Table of Contents"
      className={classnames(styles.nav, className)}
      ref={ref}
      style={style}
      onContextMenu={onContextMenu}
    >
      <div className={styles.indicator} ref={indicatorRef} />
      <ul className={styles.list}>
        {filteredHeadings.map((value) => (
          <li
            key={value.id}
            className={classnames(styles.listItem, {
              [styles.active]: value.id === activeAnchorId,
            })}
          >
            <Link
              aria-current={value.id === activeAnchorId ? "page" : "false"}
              className={styles.link}
              data-level={value.level}
              to={`#${value.id}`}
              onClick={handleLinkClick(value.id)}
              id={value.id}
            >
              {value.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
});
