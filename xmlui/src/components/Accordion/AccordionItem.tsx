import { createMetadata, d } from "@abstractions/ComponentDefs";
import { AccordionItemComponent } from "@components/Accordion/AccordionItemNative";
import { createComponentRendererNew } from "../../index";

const COMP = "AccordionItem";

export const AccordionItemMd = createMetadata({
  description:
    `\`${COMP}\` is a non-visual component describing a tab. Tabs component may use nested ` +
    `${COMP} instances from which the user can select.`,
  props: {
    header: d("This property declares the text used in the component's header."),
    initiallyExpanded: d(
      `This property indicates if the ${COMP} is expanded (\`true\`) or collapsed (\`false\`).`,
      null,
      "boolean",
      false,
    ),
  },
});

export const accordionItemComponentRenderer = createComponentRendererNew(
  COMP,
  AccordionItemMd,
  (rendererContext) => {
    const { node, renderChild, extractValue } = rendererContext;
    return (
      <AccordionItemComponent
        header={extractValue(node.props.header)}
        content={renderChild(node.children)}
      />
    );
  },
);
