import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./TableOfContents.module.scss";
import { useEffect, useRef } from "react";
import classnames from "classnames";
import { useTableOfContents } from "@components-core/TableOfContentsContext";
import { NavLink as RrdNavLink } from "@remix-run/react";
import scrollIntoView from "scroll-into-view-if-needed";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";

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
        {headings.map((value) => (
          <li
            key={value.id}
            className={classnames({
              [styles.head_1]: value.level === 1,
              [styles.head_2]: value.level === 2,
              [styles.head_3]: value.level === 3,
              [styles.head_4]: value.level === 4,
              [styles.active]: value.id === activeAnchorId,
            })}
          >
            <RrdNavLink to={`#${value.id}`} onClick={() => setActiveAnchorId(value.id)} id={value.id}>
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
  props: {};
}

const metadata: ComponentDescriptor<TableOfContentsComponentDef> = {
  displayName: "TableOfContents",
  description: "Table of contents",
  props: {
    //...
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "font-size-TableOfContentsItem": "$font-size-smaller",
    "font-weight-TableOfContentsItem": "$font-weight-normal",
    "font-family-TableOfContentsItem": "$font-family",
    "font-weight-TableOfContentsItem-active": "$font-weight-bold",
    "color-TableOfContentsItem": "$color-text",
    "color-TableOfContentsItem-active": "$color-text-secondary",
    "color-bg-TableOfContents": "transparent",
    "padding-horizontal-TableOfContents": "$space-4",
    "padding-vertical-TableOfContents": "$space-4",
    "margin-top-TableOfContents": "0",
    "margin-bottom-TableOfContents": "0",
    "border-radius-TableOfContents": "0",
    "border-width-TableOfContents": "0",
    "border-color-TableOfContents": "transparent",
    "border-style-TableOfContents": "solid",
    "transform-TableOfContentsItem": "none",
    "align-vertical-TableOfContentsItem": "baseline",
    "letter-spacing-TableOfContentsItem": "0",
  },
};

export const tableOfContentsRenderer = createComponentRenderer<TableOfContentsComponentDef>(
  "TableOfContents",
  ({}) => {
    return <TableOfContents />;
  },
  metadata,
);
