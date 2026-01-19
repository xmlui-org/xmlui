import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "@remix-run/react";
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

  useIsomorphicLayoutEffect(() => {
    return subscribeToActiveAnchorChange((id) => {
      const foundHeading = headings.find((heading) => heading.id === id);
      if (foundHeading?.level <= maxHeadingLevel) {
        setActiveId(id);
      }
    });
  }, [headings, maxHeadingLevel, subscribeToActiveAnchorChange]);

  const ref = forwardedRef ? composeRefs(tocRef, forwardedRef) : tocRef;

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
  }, [activeAnchorId, headings]);

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
        indicatorRef.current.style.display = 'block';
      }
    } else if (indicatorRef?.current) {
      indicatorRef.current.style.display = 'none';
    }
  }, [activeAnchorId, headings]);

  return (
    <nav
      {...rest}
      aria-label="Table of Contents"
      className={classnames(styles.nav, className)}
      ref={ref}
      style={style}
    >
      <div className={styles.indicator} ref={indicatorRef} />
      <ul className={styles.list}>
        {headings.map((value) => {
          if (value.level <= maxHeadingLevel && (!omitH1 || value.level !== 1)) {
            return (
              <li
                key={value.id}
                className={classnames(styles.listItem, {
                  [styles.active]: value.id === activeAnchorId,
                })}
              >
                <Link
                  aria-current={value.id === activeAnchorId ? "page" : "false"}
                  className={classnames(styles.link, {
                    [styles.head_1]: value.level === 1,
                    [styles.head_2]: value.level === 2,
                    [styles.head_3]: value.level === 3,
                    [styles.head_4]: value.level === 4,
                    [styles.head_5]: value.level === 5,
                    [styles.head_6]: value.level === 6,
                  })}
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
            );
          }
          return null;
        })}
      </ul>
    </nav>
  );
});
