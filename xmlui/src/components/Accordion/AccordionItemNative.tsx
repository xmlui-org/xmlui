import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
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
  const itemRef = useRef<HTMLButtonElement>(null);
  const {
    expandItem,
    collapseItem,
    register,
    unRegister,
    hideIcon,
    expandedIcon,
    collapsedIcon,
    triggerPosition,
  } = useAccordionContext();

  const doExpand = useEvent(() => {
    setExpanded(true);
  });

  const doFocus = useCallback(() => {
    itemRef.current?.focus();
  }, []);

  const doToggle = useEvent(() => {
    setExpanded(!expanded);
  });

  const doCollapse = useEvent(() => {
    setExpanded(false);
  });

  useEffect(() => {
    registerComponentApi?.({
      expanded: () => {},
      expand: doExpand,
      collapse: doCollapse,
      toggle: doToggle,
      focus: doFocus,
    });
  }, [doCollapse, doExpand, doFocus, doToggle, registerComponentApi]);

  useEffect(() => {
    if (expanded) {
      expandItem(id);
    } else {
      collapseItem(id);
    }
    //onDisplayDidChange?.(expanded);
  }, [collapseItem, expandItem, expanded, id, onDisplayDidChange]);

  const item = useMemo(
    () => (
      <RAccordion.Item
        key={id}
        value={id}
        className={styles.item}
        onClick={doToggle}
      >
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
    ),
    [id, doToggle, triggerPosition, headerRenderer, header, hideIcon, expanded, expandedIcon, collapsedIcon, content],
  );

  useEffect(() => {
    register({
      header,
      content: item,
      id,
    });
  }, [id, header, item, register]);

  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);
  return null;
}
