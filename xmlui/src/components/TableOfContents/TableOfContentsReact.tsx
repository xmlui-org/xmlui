import { memo, useEffect, useState, type CSSProperties } from "react";

import { defaultProps } from "./TableOfContents.defaults";
import styles from "./TableOfContents.module.scss";

export type TocHeading = {
  id: string;
  text: string;
  level: number;
};

export type TableOfContentsProps = {
  smoothScrolling?: boolean;
  maxHeadingLevel?: number;
  omitH1?: boolean;
  className?: string;
  style?: CSSProperties;
  "data-testid"?: string;
};

export const TableOfContentsNative = memo(function TableOfContentsNative({
  smoothScrolling = defaultProps.smoothScrolling,
  maxHeadingLevel = defaultProps.maxHeadingLevel,
  omitH1 = defaultProps.omitH1,
  className,
  style,
  "data-testid": dataTestId,
  ...rest
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6,[data-anchor='true'][data-bookmark-title],[data-anchor='true'][data-bookmark-level]"));
    setHeadings(nodes.flatMap((node, index) => {
      if (node instanceof HTMLElement && node.dataset.bookmarkOmitFromToc === "true") {
        return [];
      }
      const level = Number(node.tagName.slice(1));
      const bookmarkLevel = node instanceof HTMLElement && node.dataset.bookmarkLevel
        ? Number(node.dataset.bookmarkLevel)
        : undefined;
      const effectiveLevel = Number.isFinite(level) ? level : bookmarkLevel ?? 1;
      const isHeading = /^H[1-6]$/.test(node.tagName);
      const isBookmark = !isHeading;
      const omitFromToc = node instanceof HTMLElement && node.dataset.xmluiOmitFromToc === "true";
      if (omitFromToc) {
        return [];
      }
      if (effectiveLevel > maxHeadingLevel || (omitH1 && effectiveLevel === 1)) {
        return [];
      }
      if (isBookmark && !node.id) {
        return [];
      }
      if (!node.id) {
        node.id = isHeading ? `xmlui-heading-${index}` : `xmlui-bookmark-${index}`;
      }
      const title = node instanceof HTMLElement ? node.dataset.bookmarkTitle : undefined;
      const text = title || node.textContent?.trim() || node.id;
      return [{
        id: node.id,
        text,
        level: effectiveLevel,
      }];
    }));
  }, [maxHeadingLevel, omitH1]);

  return (
    <nav {...rest} className={[styles.root, className].filter(Boolean).join(" ")} style={style} data-testid={dataTestId}>
      {headings.map((heading, index) => (
        <div
          key={`${heading.id}-${index}`}
          className={[styles.itemWrapper, activeId === heading.id ? styles.active : ""].filter(Boolean).join(" ")}
          style={activeId === heading.id ? { backgroundColor: "var(--xmlui-backgroundColor-TableOfContentsItem--active, rgb(150, 150, 255))" } : undefined}
        >
          <a
            className={[styles.item, levelClass(heading.level)].filter(Boolean).join(" ")}
            href={`#${heading.id}`}
            aria-current={activeId === heading.id ? "page" : undefined}
            onClick={(event) => {
              setActiveId(heading.id);
              if (!smoothScrolling) {
                return;
              }
              event.preventDefault();
              document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
              window.history.replaceState(null, "", `#${heading.id}`);
            }}
          >
            {heading.text}
          </a>
        </div>
      ))}
    </nav>
  );
});

function levelClass(level: number): string | undefined {
  if (level === 1) return styles.level1;
  if (level === 2) return styles.level2;
  if (level === 3) return styles.level3;
  if (level === 4) return styles.level4;
  if (level === 5) return styles.level5;
  if (level === 6) return styles.level6;
  return undefined;
}
