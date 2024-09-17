import styles from "./List.module.scss";
import { MemoizedItem } from "@components/container-helpers";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { DynamicHeightList, MemoizedSection } from "./ListNative";
import { dComponent } from "@components/metadata-helpers";

const COMP = "List";

export const ListMd = createMetadata({
  description:
    `The \`${COMP}\` component is a robust layout container that renders associated data items ` +
    `as a list of components. \`${COMP}\` is virtualized; it renders only items that are visible ` +
    `in the viewport.`,
  props: {
    data: d(
      `The component receives data via this property. The \`data\` property is a list of items ` +
        `that the \`List\` can display.`,
    ),
    items: d(
      `You can use \`items\` as an alias for the \`data\` property. When you bind the table to a ` +
        `data source (for example, you set the \`datasource\` property to a URL to fetch the data ` +
        `from), \`data\` represents the information obtained from the API.`,
    ),
    loading: d(
      `This property delays the rendering of children until it is set to \`false\`, or the ` +
        `component receives usable list items via the [\`data\`](#data) property.`,
    ),
    limit: d(`This property limits the number of items displayed in the \`${COMP}\`.`),
    scrollAnchor: d(
      `This property pins the scroll position to either the \`top\` or the \`bottom\` of the list.`,
    ),
    sectionBy: d(
      `This property set which attribute of the data is used to group or section the list items. ` +
        `If the attribute does not appear in the data items, it will be ignored.`,
    ),
    orderBy: d(
      `This property enables the ordering of list items by specifying an attribute in the data.`,
    ),
    availableSections: d(
      `This property is an array of section names that the \`${COMP}\` will display.`,
    ),
    sectionTemplate: dComponent(
      `Enables the customization of how the sections or groups are displayed, similarly to the ` +
        `[\`itemTemplate\`](#itemtemplate). You can use the \`$item\` context variable to access ` +
        `an item section and map its individual attributes.`,
    ),
    sectionFooterTemplate: dComponent(
      `Enables the customization of how the the footer of each section or group id displayed. ` +
        `Combine with [\`sectionTemplate\`](#sectiontemplate) to customize sections. You can use ` +
        `the \`$item\` context variable to access an item section and map its individual attributes.`,
    ),
    itemTemplate: dComponent(
      `This property allows the customization of mapping data items to components. You can use ` +
        `the \`$item\` context variable to access an item and map its individual attributes.`,
    ),
    emptyListTemplate: dComponent(
      `This property defines the template to display when the list is empty.`,
    ),
    pageInfo: d(
      `This property contains the current page information. Setting this property also enures the ` +
        `\`${COMP}\` uses pagination.`,
    ),
    idKey: d(
      `Denotes which attribute of an item acts as the ID or key of the item. Default is \`"id"\`.`,
    ),
    selectedIndex: d(`This property scrolls to a specific item indicated by its index.`),
    sectionsInitiallyExpanded: d(
      `This Boolean property defines whether the list sections are initially expanded.`,
    ),
    defaultSections: d(
      `This property adds default sections for the \`${COMP}\` and displays the section headers ` +
        `even if no items fall into a particular section.`,
    ),
  },
  events: {
    resetSelectedIndex: d(`Obsolete.`),
    requestFetchNextPage: d(`Obsolete.`),
    requestFetchPrevPage: d(`Obsolete.`),
  },
  contextVars: {
    $item: d(`This property represents the value of an item in the data list.`),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const dynamicHeightListComponentRenderer = createComponentRendererNew(
  COMP,
  ListMd,
  ({
    node,
    extractValue,
    renderChild,
    lookupAction,
    layoutCss,
    layoutContext,
    lookupEventHandler,
  }) => {
    return (
      <DynamicHeightList
        layout={layoutCss}
        loading={extractValue.asOptionalBoolean(node.props.loading)}
        items={extractValue(node.props.items) || extractValue(node.props.data)}
        limit={extractValue(node.props.limit)}
        sectionBy={extractValue(node.props.sectionBy)}
        orderBy={extractValue(node.props.orderBy)}
        availableSections={extractValue(node.props.availableSections)}
        scrollAnchor={node.props.scrollAnchor as any}
        pageInfo={extractValue(node.props.pageInfo)}
        idKey={extractValue(node.props.idKey)}
        requestFetchPrevPage={lookupEventHandler("requestFetchPrevPage")}
        selectedIndex={extractValue(node.props.selectedIndex)}
        resetSelectedIndex={lookupAction(node.events?.resetSelectedIndex)}
        emptyListPlaceholder={renderChild(node.props.emptyListTemplate)}
        sectionsInitiallyExpanded={extractValue.asOptionalBoolean(
          node.props.sectionsInitiallyExpanded,
        )}
        defaultSections={extractValue(node.props.defaultSections)}
        itemRenderer={
          node.props.itemTemplate &&
          ((item) => {
            return (
              <MemoizedItem
                node={node.props.itemTemplate as any}
                item={item}
                renderChild={renderChild}
                layoutContext={layoutContext}
              />
            );
          })
        }
        sectionRenderer={
          node.props.sectionBy
            ? (item) => (
                <MemoizedSection
                  node={node.props.sectionTemplate ?? ({ type: "Fragment" } as any)}
                  renderChild={renderChild}
                  item={item}
                />
              )
            : undefined
        }
        sectionFooterRenderer={
          node.props.sectionFooterTemplate
            ? (item) => (
                <MemoizedItem
                  node={node.props.sectionFooterTemplate ?? ({ type: "Fragment" } as any)}
                  item={item}
                  renderChild={renderChild}
                />
              )
            : undefined
        }
      />
    );
  },
);
