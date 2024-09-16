import { createMetadata } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { dLabel } from "@components/metadata-helpers";
import {AccordionItemComponent} from "@components/Accordion/AccordionItemNative";

const COMP = "AccordionItem";

export const AccordionItemMd = createMetadata({
    description:
        `\`${COMP}\` is a non-visual component describing a tab. Tabs component may use nested ` +
        `${COMP} instances from which the user can select.`,
    props: {
        header: dLabel(),
    },
});

export const accordionItemComponentRenderer = createComponentRendererNew(
    COMP,
    AccordionItemMd,
    (rendererContext) => {
        const { node, renderChild, extractValue } = rendererContext;
        return (
            <AccordionItemComponent header={extractValue(node.props.header)} content={renderChild(node.children)} />
        );
    },
);
