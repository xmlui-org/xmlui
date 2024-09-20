import { type ReactNode, useEffect, useId, useMemo, useRef } from "react";
import { useAccordionContext } from "@components/Accordion/AccordionContext";
import styles from "@components/Accordion/Accordion.module.scss";
import Icon from "@components/Icon/IconNative";
import * as RAccordion from "@radix-ui/react-accordion";
import classnames from "classnames";

function defaultRenderer(header: string) {
  return <div>{header}</div>;
}

type Props = {
  id: string;
  /**
   * The header of the accordion.
   */
  header: string;

  headerRenderer?: (header: string) => ReactNode;

  /**
   * The content of the accordion.
   */
  content: ReactNode;
};

export function AccordionItemComponent({
  id,
  header,
  headerRenderer = defaultRenderer,
  content,
}: Props) {
  const itemId = id ? `${id}` : useId();
  const itemRef = useRef<any>(null);
  const {
    expandedItems,
    hideIcon,
    expandedIcon,
    collapsedIcon,
    triggerPosition,
    register,
    unRegister,
  } = useAccordionContext();

  const expanded = useMemo(() => expandedItems.includes(itemId), [itemId, expandedItems]);

  useEffect(() => {
    if (itemRef?.current) {
      register(itemId, itemRef.current);
    }
  }, [itemId, itemRef, register]);

  useEffect(() => {
    return () => {
      unRegister(itemId);
    };
  }, [itemId, unRegister]);

  return (
    <RAccordion.Item key={itemId} value={itemId} className={styles.item}>
      <RAccordion.Header className={styles.header}>
        <RAccordion.Trigger
          ref={itemRef}
          className={classnames(styles.trigger, {
            [styles.triggerStart]: triggerPosition === "start",
          })}
        >
          {headerRenderer(header)}
          {!hideIcon ? (
            expanded ? (
              <Icon name={expandedIcon} className={styles.chevron} />
            ) : (
              <Icon name={collapsedIcon} className={styles.chevron} />
            )
          ) : null}
        </RAccordion.Trigger>
      </RAccordion.Header>
      <RAccordion.Content className={styles.contentWrapper}>
        <div className={styles.content}>{content}</div>
      </RAccordion.Content>
    </RAccordion.Item>
  );
}
