import { memo, useEffect, useState, type CSSProperties } from "react";

import { defaultProps } from "./TableOfContents.defaults";
import styles from "./TableOfContents.module.scss?xmlui-css-module";

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
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
    setHeadings(nodes.flatMap((node, index) => {
      const level = Number(node.tagName.slice(1));
      if (level > maxHeadingLevel || (omitH1 && level === 1)) {
        return [];
      }
      if (!node.id) {
        node.id = `xmlui-heading-${index}`;
      }
      return [{
        id: node.id,
        text: node.textContent ?? "",
        level,
      }];
    }));
  }, [maxHeadingLevel, omitH1]);

  return (
    <nav {...rest} className={[styles.root, className].filter(Boolean).join(" ")} style={style} data-testid={dataTestId}>
      {headings.map((heading) => (
        <a
          key={heading.id}
          className={[styles.item, levelClass(heading.level)].filter(Boolean).join(" ")}
          href={`#${heading.id}`}
          onClick={(event) => {
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
      ))}
    </nav>
  );
});

function levelClass(level: number): string | undefined {
  if (level === 2) return styles.level2;
  if (level === 3) return styles.level3;
  if (level === 4) return styles.level4;
  if (level === 5) return styles.level5;
  if (level === 6) return styles.level6;
  return undefined;
}
