import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./TableOfContents.module.scss";
import { useEffect, useRef } from "react";
import classnames from "classnames";
import { useTableOfContents } from "@components-core/TableOfContentsContext";
import { NavLink as RrdNavLink } from "@remix-run/react";
import scrollIntoView from "scroll-into-view-if-needed";

export const TableOfContents = () => {
  const tocRef = useRef<HTMLDivElement>(null);
  const { headings, setObserveIntersection, activeAnchorId, setActiveAnchorId } = useTableOfContents();

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
    <div className={styles.nav} ref={tocRef}>
      <ul>
        {Object.entries(headings).map(([key, value]) => (
          <li
            key={key}
            className={classnames({
              [styles.head_1]: value.level === 1,
              [styles.head_2]: value.level === 2,
              [styles.head_3]: value.level === 3,
              [styles.head_4]: value.level === 4,
              [styles.active]: value.id === activeAnchorId,
            })}
          >
            <RrdNavLink to={`#${key}`} onClick={() => setActiveAnchorId(value.id)} id={key}>
              {value.text}
            </RrdNavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * (Document it)
 */
export interface TableOfContentsComponentDef extends ComponentDef<"TableOfContents"> {
  props: {
    scrollMarginTop?: number;
  };
}

export const tableOfContentsRenderer = createComponentRenderer<TableOfContentsComponentDef>("TableOfContents", ({}) => {
  return <TableOfContents />;
});
