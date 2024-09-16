import styles from "./TableOfContents.module.scss";
import { CSSProperties, useEffect, useRef } from "react";
import classnames from "classnames";
import { useTableOfContents } from "@components-core/TableOfContentsContext";
import { NavLink as RrdNavLink } from "@remix-run/react";
import scrollIntoView from "scroll-into-view-if-needed";

type Props = {
  layout?: CSSProperties;
  smoothScrolling?: boolean;
};

export const TableOfContents = ({ layout, smoothScrolling }: Props) => {
  const tocRef = useRef<HTMLDivElement>(null);
  const { headings, setObserveIntersection, activeAnchorId, setActiveAnchorId } =
    useTableOfContents();

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
    <div className={styles.nav} ref={tocRef} style={layout}>
      <ul className={styles.list}>
        {headings.map((value) => (
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
              onClick={() => {
                if (smoothScrolling) {
                  scrollIntoView(value.anchor, {
                    block: "start",
                    inline: "start",
                    behavior: "smooth",
                    scrollMode: "if-needed",
                  });
                }

                setActiveAnchorId(value.id);
              }}
              id={value.id}
            >
              {value.text}
            </RrdNavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
