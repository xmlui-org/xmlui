import * as RAccordion from "@radix-ui/react-accordion";
import { AccordionContext, useAccordionContextValue } from "@components/Accordion/AccordionContext";
import styles from "./Accordion.module.scss";
import Icon from "@components/Icon/IconNative";
import type { Accordion } from "@components/abstractions";
import { useState } from "react";

type Props = {
  children?: React.ReactNode;
  headerRenderer: (item: Accordion) => React.ReactNode;
  triggerPosition?: string;
  collapsedIcon?: string;
  expandedIcon?: string;
  hideIcon?: boolean;
  rotateExpanded?: string;
};

function defaultRenderer(item: Accordion) {
  return <div>{item.header}</div>;
}

const positionInGroupValues = ["single", "first", "middle", "last"] as const;
export const positionInGroupNames: string[] = [...positionInGroupValues];

export const AccordionComponent = ({
  children,
  headerRenderer = defaultRenderer,
  hideIcon = false,
  expandedIcon = "chevronup",
  collapsedIcon = "chevrondown",
}: Props) => {
  const { accordionContextValue, accordionItems } = useAccordionContextValue();
  const [value, setValue] = useState<string | null>(null);

  return (
    <AccordionContext.Provider value={accordionContextValue}>
      {children}
      <RAccordion.Root
        type="single"
        className={styles.root}
        onValueChange={(changedValue) => {
          setValue(changedValue);
        }}
        collapsible
      >
        {accordionItems.map((item) => (
          <RAccordion.Item key={item.id} value={item.id} className={styles.item}>
            <RAccordion.Header className={styles.header}>
              <RAccordion.Trigger className={styles.trigger}>
                {headerRenderer(item)}
                {!hideIcon ? item.id === value ? (
                  <Icon name={expandedIcon} className={styles.chevron} />
                ) : (
                  <Icon name={collapsedIcon} className={styles.chevron} />
                ): null}
              </RAccordion.Trigger>
            </RAccordion.Header>
            <RAccordion.Content className={styles.contentWrapper}>
              <div className={styles.content}>
                {item.content}
              </div>
            </RAccordion.Content>
          </RAccordion.Item>
        ))}
      </RAccordion.Root>
    </AccordionContext.Provider>
  );
};
