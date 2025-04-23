import styles from "./List.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../container-helpers";
import { dComponent, dInternal } from "../metadata-helpers";
import { scrollAnchoringValues } from "../abstractions";
import { ListNative, MemoizedSection } from "./ListNative";

const COMP = "List";

export const ListMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` component is a robust layout container that renders associated data items ` +
    `as a list of components. \`${COMP}\` is virtualized; it renders only items that are visible ` +
    `in the viewport.`,
  props: {
    data: d(
      `The component receives data via this property. The \`data\` property is a list of items ` +
        `that the \`List\` can display.`,
    ),
    items: dInternal(
      `You can use \`items\` as an alias for the \`data\` property. ` +
        `When you bind the list to a data source (e.g. an API endpoint), ` +
        `the \`data\` acts as the property that accepts a URL to fetch information from an API.` +
        `When both \`items\` and \`data\` are used, \`items\` has priority.`,
    ),
    loading: d(
      `This property delays the rendering of children until it is set to \`false\`, or the ` +
        `component receives usable list items via the [\`data\`](#data) property.`,
    ),
    limit: d(`This property limits the number of items displayed in the \`${COMP}\`.`),
    scrollAnchor: {
      description: `This property pins the scroll position to a specified location of the list. Available values are shown below.`,
      availableValues: scrollAnchoringValues,
      type: "string",
      defaultValue: "top",
    },
    groupBy: d(
      `This property sets which attribute of the data is used to group the list items. ` +
        `If the attribute does not appear in the data, it will be ignored.`,
    ),
    orderBy: d(
      `This property enables the ordering of list items by specifying an attribute in the data.`,
    ),
    availableGroups: d(
      `This property is an array of group names that the \`${COMP}\` will display.`,
    ),
    groupHeaderTemplate: dComponent(
      `Enables the customization of how the groups are displayed, similarly to the ` +
        `[\`itemTemplate\`](#itemtemplate). You can use the \`$item\` context variable to access ` +
        `an item group and map its individual attributes.`,
    ),
    groupFooterTemplate: dComponent(
      `Enables the customization of how the the footer of each group is displayed. ` +
        `Combine with [\`groupHeaderTemplate\`](#groupHeaderTemplate) to customize sections. You can use ` +
        `the \`$item\` context variable to access an item group and map its individual attributes.`,
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
    idKey: {
      description: "Denotes which attribute of an item acts as the ID or key of the item",
      type: "string",
      defaultValue: "id",
    },
    groupsInitiallyExpanded: d(
      `This Boolean property defines whether the list groups are initially expanded.`,
    ),
    defaultGroups: d(
      `This property adds a list of default groups for the \`${COMP}\` and displays the group ` +
        `headers in the specified order. If the data contains group headers not in this list, ` +
        `those headers are also displayed (after the ones in this list); however, their order ` +
        `is not deterministic.`,
    ),
    hideEmptyGroups: {
      description:
        "This boolean property indicates if empty groups should be hidden (no header and footer are displayed).",
      valueType: "boolean",
      defaultValue: true,
    },
    borderCollapse: {
      description: "Collapse items borders",
      valueType: "boolean",
      defaultValue: true,
    },
  },
  childrenAsTemplate: "itemTemplate",
  apis: {
    scrollToTop: d("This method scrolls the list to the top."),
    scrollToBottom: d("This method scrolls the list to the bottom."),
    scrollToIndex: d(
      "This method scrolls the list to a specific index. The method accepts an index as a parameter.",
    ),
    scrollToId: d(
      "This method scrolls the list to a specific item. The method accepts an item ID as a parameter.",
    ),
  },
  contextVars: {
    $item: d(`This property represents the value of an item in the data list.`),
    $itemIndex: dComponent(
      "This integer value represents the current row index (zero-based) while rendering children.",
    ),
    $isFirst: dComponent("This boolean value indicates if the component renders its first item."),
    $isLast: dComponent("This boolean value indicates if the component renders its last item."),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const dynamicHeightListComponentRenderer = createComponentRenderer(
  COMP,
  ListMd,
  ({
    node,
    extractValue,
    renderChild,
    layoutCss,
    layoutContext,
    lookupEventHandler,
    registerComponentApi,
  }) => {
    const itemTemplate = node.props.itemTemplate;
    const hideEmptyGroups = extractValue.asOptionalBoolean(node.props.hideEmptyGroups, true);
    return (
      <ListNative
        registerComponentApi={registerComponentApi}
        style={layoutCss}
        loading={extractValue.asOptionalBoolean(node.props.loading)}
        items={extractValue(node.props.items) || extractValue(node.props.data)}
        limit={extractValue(node.props.limit)}
        groupBy={extractValue(node.props.groupBy)}
        orderBy={extractValue(node.props.orderBy)}
        availableGroups={extractValue(node.props.availableGroups)}
        scrollAnchor={node.props.scrollAnchor as any}
        pageInfo={extractValue(node.props.pageInfo)}
        idKey={extractValue(node.props.idKey)}
        requestFetchPrevPage={lookupEventHandler("requestFetchPrevPage")}
        requestFetchNextPage={lookupEventHandler("requestFetchNextPage")}
        emptyListPlaceholder={renderChild(node.props.emptyListTemplate)}
        groupsInitiallyExpanded={extractValue.asOptionalBoolean(node.props.groupsInitiallyExpanded)}
        defaultGroups={extractValue(node.props.defaultGroups)}
        borderCollapse={extractValue.asOptionalBoolean(node.props.borderCollapse, true)}
        itemRenderer={
          itemTemplate &&
          ((item, key, rowIndex, count) => {
            return (
              <MemoizedItem
                node={itemTemplate as any}
                item={item}
                key={key}
                renderChild={renderChild}
                layoutContext={layoutContext}
                contextVars={{
                  $itemIndex: rowIndex,
                  $isFirst: rowIndex === 0,
                  $isLast: rowIndex === count - 1,
                }}
              />
            );
          })
        }
        sectionRenderer={
          node.props.groupBy
            ? (item, key) =>
                (item.items?.length ?? 0) > 0 || !hideEmptyGroups ? (
                  <MemoizedSection
                    node={node.props.groupHeaderTemplate ?? ({ type: "Fragment" } as any)}
                    renderChild={renderChild}
                    key={key}
                    item={item}
                  />
                ) : null
            : undefined
        }
        sectionFooterRenderer={
          node.props.groupFooterTemplate
            ? (item, key) =>
                (item.items?.length ?? 0) > 0 || !hideEmptyGroups ? (
                  <MemoizedItem
                    node={node.props.groupFooterTemplate ?? ({ type: "Fragment" } as any)}
                    item={item}
                    renderChild={renderChild}
                    key={key}
                    itemKey="$group"
                    contextKey="$group"
                  />
                ) : null
            : undefined
        }
      />
    );
  },
);
