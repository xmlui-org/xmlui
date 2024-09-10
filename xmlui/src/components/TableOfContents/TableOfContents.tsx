import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./TableOfContents.module.scss";
import {CSSProperties, useEffect, useRef} from "react";
import classnames from "classnames";
import { useTableOfContents } from "@components-core/TableOfContentsContext";
import { NavLink as RrdNavLink } from "@remix-run/react";
import scrollIntoView from "scroll-into-view-if-needed";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";

type TableOfContentsProp = {
  layout?: CSSProperties;
}

export const TableOfContents = ({layout}: TableOfContentsProp) => {
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
    <div className={styles.nav} ref={tocRef} style={layout}>
      <ul className={styles.list}>
        {headings.map((value) => (
          <li key={value.id} className={classnames(styles.listItem, {
            [styles.active]: value.id === activeAnchorId,
          })}>
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
              onClick={() => setActiveAnchorId(value.id)}
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

/**
 * (Document it)
 */
export interface TableOfContentsComponentDef extends ComponentDef<"TableOfContents"> {
  props: {};
}

export const TableOfContentsMd: ComponentDescriptor<TableOfContentsComponentDef> = {
  displayName: "TableOfContents",
  description: "Table of contents",
  props: {
    //...
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "width-TableOfContents": "auto",
    "height-TableOfContents": "auto",
    "font-size-TableOfContentsItem": "$font-size-smaller",
    "font-weight-TableOfContentsItem": "$font-weight-normal",
    "font-family-TableOfContentsItem": "$font-family",
    "border-radius-TableOfContentsItem": "0",
    "border-width-TableOfContentsItem": "$space-0_5",
    "border-style-TableOfContentsItem": "solid",
    "border-radius-TableOfContentsItem--active": "0",
    "border-width-TableOfContentsItem--active": "$space-0_5",
    "border-style-TableOfContentsItem--active": "solid",
    "font-weight-TableOfContentsItem--active": "$font-weight-bold",
    "color-bg-TableOfContents": "transparent",
    "padding-horizontal-TableOfContents": "$space-8",
    "padding-vertical-TableOfContents": "$space-4",
    "padding-horizontal-TableOfContentsItem": "$space-2",
    "padding-vertical-TableOfContentsItem": "$space-2",
    "padding-horizontal-TableOfContentsItem-level-1": "unset",
    "padding-horizontal-TableOfContentsItem-level-2": "unset",
    "padding-horizontal-TableOfContentsItem-level-3": "unset",
    "padding-horizontal-TableOfContentsItem-level-4": "unset",
    "padding-horizontal-TableOfContentsItem-level-5": "unset",
    "padding-horizontal-TableOfContentsItem-level-6": "unset",
    "margin-top-TableOfContents": "0",
    "margin-bottom-TableOfContents": "0",
    "border-radius-TableOfContents": "0",
    "border-width-TableOfContents": "0",
    "border-color-TableOfContents": "transparent",
    "border-style-TableOfContents": "solid",
    "transform-TableOfContentsItem": "none",
    "align-vertical-TableOfContentsItem": "baseline",
    "letter-spacing-TableOfContentsItem": "0",
    light: {
      "color-TableOfContentsItem": "$color-text-primary",
      "border-color-TableOfContentsItem": "$color-border",
      "border-color-TableOfContentsItem--active": "$color-primary-500",
      "color-TableOfContentsItem--active": "$color-primary-500",
    },
    dark: {
      "color-TableOfContentsItem": "$color-text-primary",
      "border-color-TableOfContentsItem": "$color-border",
      "border-color-TableOfContentsItem--active": "$color-primary-500",
      "color-TableOfContentsItem--active": "$color-text-secondary",
    },
  },
};

export const tableOfContentsRenderer = createComponentRenderer<TableOfContentsComponentDef>(
  "TableOfContents",
  ({layoutCss}) => {
    return <TableOfContents layout={layoutCss}/>;
  },
  TableOfContentsMd,
);
