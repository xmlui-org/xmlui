import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { dComponent } from "../../components/metadata-helpers";
import { MemoizedItem } from "../../components/container-helpers";
import { AccordionItemComponent } from "../../components/Accordion/AccordionItemNative";

const COMP = "AccordionItem";

export const AccordionItemMd = createMetadata({
  description:
    `\`${COMP}\` is a non-visual component describing a tab. Tabs component may use nested ` +
    `${COMP} instances from which the user can select.`,
  props: {
    header: d("This property declares the text used in the component's header."),
    headerTemplate: dComponent(
      "This property describes the template to use as the component's header.",
    ),
    initiallyExpanded: d(
      `This property indicates if the ${COMP} is expanded (\`true\`) or collapsed (\`false\`).`,
      null,
      "boolean",
      false,
    ),
  },
});

export const accordionItemComponentRenderer = createComponentRenderer(
  COMP,
  AccordionItemMd,
  (rendererContext) => {
    const { node, renderChild, extractValue, layoutCss } = rendererContext;
    return (
      <AccordionItemComponent
        style={layoutCss}
        id={extractValue(node.uid)}
        header={extractValue(node.props.header)}
        initiallyExpanded={extractValue.asOptionalBoolean(node.props.initiallyExpanded)}
        headerRenderer={
          node.props.headerTemplate
            ? (item) => (
                <MemoizedItem
                  node={node.props.headerTemplate ?? ({ type: "Fragment" } as any)}
                  item={item}
                  renderChild={renderChild}
                />
              )
            : undefined
        }
        content={renderChild(node.children)}
      />
    );
  },
);
