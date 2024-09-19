import { createMetadata, d } from "@abstractions/ComponentDefs";
import { AccordionItemComponent } from "@components/Accordion/AccordionItemNative";
import {
  dCollapse,
  dComponent,
  dDidChange,
  dExpand,
  dExpanded,
  dFocus,
} from "@components/metadata-helpers";
import { MemoizedItem } from "@components/container-helpers";
import {createComponentRenderer} from "@components-core/renderers";

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
  events: {
    displayDidChange: dDidChange(COMP),
  },
  apis: {
    expanded: dExpanded(COMP),
    expand: dExpand(COMP),
    collapse: dCollapse(COMP),
    toggle: d(`This method toggles the state of the ${COMP} between expanded and collapsed.`),
    focus: dFocus(COMP),
  },
});

export const accordionItemComponentRenderer = createComponentRenderer(
  COMP,
  AccordionItemMd,
  (rendererContext) => {
    const { node, renderChild, extractValue, registerComponentApi } = rendererContext;
    return (
      <AccordionItemComponent
        header={extractValue(node.props.header)}
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
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
