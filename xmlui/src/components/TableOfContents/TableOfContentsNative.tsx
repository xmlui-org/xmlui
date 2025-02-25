import { CSSProperties, ForwardedRef, forwardRef, useEffect, useRef } from "react";
import { NavLink as RrdNavLink } from "@remix-run/react";
import scrollIntoView from "scroll-into-view-if-needed";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./TableOfContents.module.scss";
import { useTableOfContents } from "../../components-core/TableOfContentsContext";

type Props = {
  style?: CSSProperties;
  smoothScrolling?: boolean;
  maxHeadingLevel?: number;
};

export const TableOfContents = forwardRef(function TableOfContents(
  { style, smoothScrolling, maxHeadingLevel = 6 }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const tocRef = useRef<HTMLDivElement>(null);
  const { headings, setObserveIntersection, activeAnchorId, setActiveAnchorId } =
    useTableOfContents();
  const ref = forwardedRef ? composeRefs(tocRef, forwardedRef) : tocRef;

  useEffect(() => {
    setObserveIntersection(true);
  }, [setObserveIntersection]);

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
          if (value.level <= maxHeadingLevel) {
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
                    if (smoothScrolling) {
                      event.preventDefault();
                      scrollIntoView(value.anchor, {
                        block: "start",
                        inline: "start",
                        behavior: "smooth",
                        scrollMode: "always",
                      });
                    }

                    setActiveAnchorId(value.id);
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
