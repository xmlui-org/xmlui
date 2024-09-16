import * as RAccordion from "@radix-ui/react-accordion";
import { AccordionContext, useAccordionContextValue } from "@components/Accordion/AccordionContext";
import styles from "./Accordion.module.scss";
import Icon from "@components/Icon/IconNative";

type Props = {
  children?: React.ReactNode;
};

const positionInGroupValues = ["single", "first", "middle", "last"] as const;
export const positionInGroupNames: string[] = [...positionInGroupValues];

export const Accordion = ({ children }: Props) => {
  const { accordionContextValue, accordionItems } = useAccordionContextValue();

  return (
    <AccordionContext.Provider value={accordionContextValue}>
      {children}
      <RAccordion.Root type="single" className={styles.root}>
        {accordionItems.map((item) => (
          <RAccordion.Item key={item.id} value={item.id} className={styles.item}>
            <RAccordion.Header className={styles.header}>
              <RAccordion.Trigger className={styles.trigger}>
                  {item.header}
                  <Icon name={"chevrondown"} />
              </RAccordion.Trigger>
            </RAccordion.Header>
            <RAccordion.Content className={styles.content}>{item.content}</RAccordion.Content>
          </RAccordion.Item>
        ))}
      </RAccordion.Root>
    </AccordionContext.Provider>
  );
};
