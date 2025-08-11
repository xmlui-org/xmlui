import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, dComponent } from "../../components/metadata-helpers";
import { MemoizedItem } from "../../components/container-helpers";
import {
  AccordionItemComponent,
  defaultProps,
} from "../../components/Accordion/AccordionItemNative";

const COMP = "AccordionItem";

export const AccordionItemMd = createMetadata({
  status: "in progress",
  description:
    `\`${COMP}\` is a non-visual component describing a tab. Tabs component may use nested ` +
    `${COMP} instances from which the user can select.`,
  props: {
    header: {
      description: "This property declares the text used in the component's header. If not provided, the header will be empty.",
      valueType: "string"
    },
    headerTemplate: dComponent(
      "This property describes the template to use as the component's header.",
    ),
    initiallyExpanded: {
      description: `This property indicates if the ${COMP} is expanded (\`true\`) or collapsed (\`false\`).`,
      valueType: "boolean",
      defaultValue: defaultProps.initiallyExpanded
    },
  },
});

export const accordionItemComponentRenderer = createComponentRenderer(
  COMP,
  AccordionItemMd,
  (rendererContext) => {
    const { node, renderChild, extractValue, className } = rendererContext;
    return (
      <AccordionItemComponent
        className={className}
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
