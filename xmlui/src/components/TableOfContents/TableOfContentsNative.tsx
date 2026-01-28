import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
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

  useEffect(() => {
    if (activeAnchorId && tocRef?.current) {
      const activeAnchor = tocRef.current.querySelector(`#${activeAnchorId}`);
      if (activeAnchor) {
        scrollIntoView(activeAnchor, {
          block: "center",
          inline: "center",
          behavior: "smooth",
          scrollMode: "always",
          boundary: tocRef.current,
        });
      }
    }
  }, [activeAnchorId]);

  // Position indicator over active item
  useEffect(() => {
    if (activeAnchorId && tocRef?.current && indicatorRef?.current) {
      const activeItem = tocRef.current.querySelector(`li.${styles.active}`);
      if (activeItem) {
        const navRect = tocRef.current.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const relativeTop = itemRect.top - navRect.top + tocRef.current.scrollTop;
        const relativeLeft = itemRect.left - navRect.left;

        indicatorRef.current.style.top = `${relativeTop}px`;
        indicatorRef.current.style.left = `${relativeLeft}px`;
        indicatorRef.current.style.height = `${itemRect.height}px`;
        indicatorRef.current.style.display = "block";
      }
    } else if (indicatorRef?.current) {
      indicatorRef.current.style.display = "none";
    }
  }, [activeAnchorId]);

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
              onClick={(event) => {
                // cmd/ctrl + click - open in new tab, don't prevent that
                if (!event.ctrlKey && !event.metaKey) {
                  event.preventDefault();
                }
                scrollToAnchor(value.id, smoothScrolling);
              }}
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
