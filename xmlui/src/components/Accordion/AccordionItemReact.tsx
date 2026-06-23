import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useEffect, useMemo } from "react";

import { useAccordionContext } from "./AccordionContext";
import { defaultProps } from "./AccordionItem.defaults";

const styles = {
  item: "item",
  header: "header",
  trigger: "trigger",
  triggerStart: "triggerStart",
  contentWrapper: "contentWrapper",
  content: "content",
  chevron: "chevron",
};

export type AccordionItemProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "content"> & {
  content?: ReactNode;
  header?: ReactNode;
  id?: string;
  initiallyExpanded?: boolean;
};

export const AccordionItemComponent = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItemComponent(
  {
    className,
    content,
    header,
    id,
    initiallyExpanded = defaultProps.initiallyExpanded,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useMemo(() => `accordion-item-${Math.random().toString(36).slice(2)}`, []);
  const itemId = id || generatedId;
  const triggerId = `trigger_${itemId}`;
  const contentId = `content_${itemId}`;
  const {
    collapsedIcon,
    expandedIcon,
    hideIcon,
    isExpanded,
    registerItem,
    rotateExpanded,
    toggleItem,
    triggerPosition,
  } = useAccordionContext();
  const expanded = isExpanded(itemId);

  useEffect(() => {
    registerItem(itemId, initiallyExpanded);
  }, [initiallyExpanded, itemId, registerItem]);

  return (
    <div
      {...rest}
      ref={ref}
      id={itemId}
      className={cx(styles.item, className)}
      style={style as CSSProperties}
      data-state={expanded ? "open" : "closed"}
    >
      <h3 className={styles.header}>
        <button
          aria-controls={contentId}
          aria-expanded={expanded}
          className={cx(styles.trigger, triggerPosition === "start" && styles.triggerStart)}
          id={triggerId}
          type="button"
          onClick={() => toggleItem(itemId)}
        >
          <span>{header}</span>
          {!hideIcon ? (
            <span
              aria-hidden="true"
              className={styles.chevron}
              style={{
                transform: expanded && !expandedIcon ? `rotate(${rotateExpanded})` : "rotate(0deg)",
              }}
            >
              {expanded ? expandedIcon || collapsedIcon : collapsedIcon}
            </span>
          ) : null}
        </button>
      </h3>
      <div
        aria-labelledby={triggerId}
        className={styles.contentWrapper}
        data-state={expanded ? "open" : "closed"}
        hidden={!expanded}
        id={contentId}
        role="region"
      >
        <div className={styles.content}>{content}</div>
      </div>
    </div>
  );
});

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
