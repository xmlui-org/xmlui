import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { NavLink as RrdNavLink } from "@remix-run/react";
import scrollIntoView from "scroll-into-view-if-needed";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./TableOfContents.module.scss";
import { useTableOfContents } from "../../components-core/TableOfContentsContext";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";

type Props = {
  style?: CSSProperties;
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
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const tocRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className={styles.nav} ref={ref} style={style}>
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
                <RrdNavLink
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
                    if (!event.ctrlKey && !event.metaKey && !event.metaKey) {
                      event.preventDefault();
                    }
                    scrollToAnchor(value.id, smoothScrolling);
                  }}
                  id={value.id}
                >
                  {value.text}
                </RrdNavLink>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  );
});
