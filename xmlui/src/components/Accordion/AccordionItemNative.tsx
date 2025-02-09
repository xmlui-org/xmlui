import {
  ForwardedRef,
  forwardRef,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import * as RAccordion from "@radix-ui/react-accordion";
import classnames from "classnames";

import styles from "../../components/Accordion/Accordion.module.scss";

import { useAccordionContext } from "../../components/Accordion/AccordionContext";
import Icon from "../../components/Icon/IconNative";

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

  initiallyExpanded?: boolean;

  style?: React.CSSProperties;
};

export const AccordionItemComponent = forwardRef(function AccordionItemComponent(
  { id, header, headerRenderer = defaultRenderer, content, initiallyExpanded, style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const itemId = useMemo(() => (id ? `${id}` : generatedId), [id, generatedId]);
  const triggerId = useMemo(() => `trigger_${itemId}`, [itemId]);
  const {
    rotateExpanded,
    expandedItems,
    hideIcon,
    expandedIcon,
    collapsedIcon,
    triggerPosition,
    expandItem,
    register,
    unRegister,
  } = useAccordionContext();
  const expanded = useMemo(() => expandedItems.includes(itemId), [itemId, expandedItems]);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (!initialised) {
      setInitialised(true);
      if (initiallyExpanded) {
        expandItem(itemId);
      }
    }
  }, [expandItem, itemId, initiallyExpanded, initialised]);

  useEffect(() => {
    register(triggerId);
  }, [register, triggerId]);

  useEffect(() => {
    return () => {
      unRegister(triggerId);
    };
  }, [triggerId, unRegister]);

  return (
    <RAccordion.Item key={itemId} value={itemId} className={styles.item} ref={forwardedRef} style={style}>
      <RAccordion.Header className={styles.header}>
        <RAccordion.Trigger
          id={`trigger_${itemId}`}
          className={classnames(styles.trigger, {
            [styles.triggerStart]: triggerPosition === "start",
          })}
        >
          {headerRenderer(header)}
          {!hideIcon && (
            <span
              style={{
                transform: expanded && !expandedIcon ? `rotate(${rotateExpanded})` : "rotate(0deg)",
                transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
              }}
            >
              <Icon
                name={!expanded ? collapsedIcon : expandedIcon || collapsedIcon}
                className={styles.chevron}
              />
            </span>
          )}
        </RAccordion.Trigger>
      </RAccordion.Header>
      <RAccordion.Content className={styles.contentWrapper}>
        <div className={styles.content}>{content}</div>
      </RAccordion.Content>
    </RAccordion.Item>
  );
});
