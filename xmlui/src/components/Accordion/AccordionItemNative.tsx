import { type ReactNode, useCallback, useEffect, useId, useMemo, useState } from "react";
import { useAccordionContext } from "@components/Accordion/AccordionContext";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import styles from "@components/Accordion/Accordion.module.scss";
import Icon from "@components/Icon/IconNative";
import * as RAccordion from "@radix-ui/react-accordion";
import classnames from "classnames";

function defaultRenderer(header: string) {
  return <div>{header}</div>;
}

type Props = {
  /**
   * The header of the accordion.
   */
  header: string;

  headerRenderer?: (header: string) => ReactNode;

  /**
   * The content of the accordion.
   */
  content: ReactNode;

  registerComponentApi?: RegisterComponentApiFn;

  onDisplayDidChange?: (expanded: boolean) => void;
};

export function AccordionItemComponent({
  header,
  headerRenderer = defaultRenderer,
  content,
  onDisplayDidChange,
}: Props) {
  const id = useId();
  const {
    register,
    unRegister,
    hideIcon,
    expandedIcon,
    collapsedIcon,
    triggerPosition,
    activeItems,
    setAccordionActive,
  } = useAccordionContext();

  const onChange = useCallback(() => {
    onDisplayDidChange?.(!activeItems.includes(id));
    setAccordionActive(id);
  }, [activeItems]);

  const item = useMemo(
    () => (
      <RAccordion.Item key={id} value={id} className={styles.item} onClick={onChange}>
        <RAccordion.Header className={styles.header}>
          <RAccordion.Trigger
            className={classnames(styles.trigger, {
              [styles.triggerStart]: triggerPosition === "start",
            })}
          >
            {headerRenderer(header)}
            {!hideIcon ? (
              activeItems.includes(id) ? (
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
    ),
    [id, hideIcon, expandedIcon, collapsedIcon, triggerPosition, activeItems],
  );

  useEffect(() => {
    register({
      header,
      content: item,
      id,
    });
  }, [id, header, register, item]);

  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);
  return null;
}
