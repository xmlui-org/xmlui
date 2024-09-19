import { type ReactNode, useEffect, useId, useMemo, useState } from "react";
import { useAccordionContext } from "@components/Accordion/AccordionContext";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import styles from "@components/Accordion/Accordion.module.scss";
import Icon from "@components/Icon/IconNative";
import * as RAccordion from "@radix-ui/react-accordion";
import classnames from "classnames";
import { useEvent } from "@components-core/utils/misc";

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
  registerComponentApi,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const { registerOrUpdate, unRegister, hideIcon, expandedIcon, collapsedIcon, triggerPosition } =
    useAccordionContext();

  useEffect(() => {
    registerComponentApi?.({
      expanded: () => {},
      expand: doExpand,
      collapse: doCollapse,
      toggle: doToggle,
      focus: () => {},
    });
  }, [registerComponentApi]);

  const doExpand = useEvent(() => {
    console.log("expand");
    setExpanded(true);
  });

  const doToggle = useEvent(() => {
    console.log("toggle");
    setExpanded(!expanded);
  });

  /*  const expanded = useMemo(() => {
              return accordionItems.find((item) => item.id === id)?.expanded ?? false;
            }, [accordionItems]);*/

  const doCollapse = useEvent(() => {
    console.log("collapse");
    setExpanded(false);
  });

  const item = useMemo(
    () => (
      <RAccordion.Item
        key={id}
        value={id}
        className={styles.item}
        onClick={() => setExpanded(!expanded)}
      >
        <RAccordion.Header className={styles.header}>
          <RAccordion.Trigger
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
    ),
    [id, hideIcon, expandedIcon, collapsedIcon, triggerPosition, expanded],
  );

  useEffect(() => {
    console.log("register or update");
    registerOrUpdate({
      header,
      content: item,
      id,
      expanded,
    });
  }, [id, header, registerOrUpdate, item, expanded]);

  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);
  return null;
}
