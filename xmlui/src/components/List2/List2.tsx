import styles from "./List2.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, d, dComponent, dInternal } from "../metadata-helpers";
import { scrollAnchoringValues } from "../abstractions";
import { List2Native, MemoizedSection, defaultProps } from "./List2Native";

const COMP = "List2";

export const List2Md = createMetadata({
  status: "stable",
  description:
    "`List2` is a high-performance, virtualized container for rendering large " +
    "datasets with built-in grouping, sorting, and visual formatting. It only " +
    "renders visible items in the viewport, making it ideal for displaying " +
    "thousands of records while maintaining smooth scrolling performance.",
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
    limit: d(
      `This property limits the number of items displayed in the \`${COMP}\`. If not set, all items are displayed.`,
    ),
    scrollAnchor: {
      description: `This property pins the scroll position to a specified location of the list. Available values are shown below.`,
      availableValues: scrollAnchoringValues,
      type: "string",
      defaultValue: defaultProps.scrollAnchor,
    },
    groupBy: d(
      "This property sets which data item property is used to group the list items. If not set, " +
        "no grouping is done.",
    ),
    orderBy: d(
      `This optioanl property enables the ordering of list items by specifying an attribute in the data.`,
    ),
    availableGroups: d(
      `This property is an array of group names that the \`${COMP}\` will display. ` +
        "If not set, all groups in the data are displayed.",
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
      defaultValue: defaultProps.idKey,
    },
    groupsInitiallyExpanded: d(
      `This Boolean property defines whether the list groups are initially expanded.`,
      undefined,
      "boolean",
      defaultProps.groupsInitiallyExpanded,
    ),
    defaultGroups: d(
      `This property adds an optional list of default groups for the \`${COMP}\` and displays the group ` +
        `headers in the specified order. If the data contains group headers not in this list, ` +
        `those headers are also displayed (after the ones in this list); however, their order ` +
        `is not deterministic.`,
    ),
    hideEmptyGroups: {
      description:
        "This boolean property indicates if empty groups should be hidden (no header and footer are displayed).",
      valueType: "boolean",
      defaultValue: defaultProps.hideEmptyGroups,
    },
    borderCollapse: {
      description: "Collapse items borders",
      valueType: "boolean",
      defaultValue: defaultProps.borderCollapse,
    },
  },
  childrenAsTemplate: "itemTemplate",
  apis: {
    scrollToTop: {
      description: "This method scrolls the list to the top.",
      signature: "scrollToTop(): void",
    },
    scrollToBottom: {
      description: "This method scrolls the list to the bottom.",
      signature: "scrollToBottom(): void",
    },
    scrollToIndex: {
      description: "This method scrolls the list to a specific index. The method accepts an index as a parameter.",
      signature: "scrollToIndex(index: number): void",
      parameters: {
        index: "The index to scroll to.",
      },
    },
    scrollToId: {
      description: "This method scrolls the list to a specific item. The method accepts an item ID as a parameter.",
      signature: "scrollToId(id: string): void",
      parameters: {
        id: "The ID of the item to scroll to.",
      },
    },
  },
  contextVars: {
    $item: d("Current data item being rendered"),
    $itemIndex: dComponent("Zero-based index of current item"),
    $isFirst: dComponent("Boolean indicating if this is the first item"),
    $isLast: dComponent("Boolean indicating if this is the last item"),
    $group: dComponent("Group information when using `groupBy` (available in group templates)"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor",
  },
});

export const dynamicHeightList2ComponentRenderer = createComponentRenderer(
  COMP,
  List2Md,
  ({
    node,
    extractValue,
    renderChild,
    className,
    layoutContext,
    lookupEventHandler,
    registerComponentApi,
  }) => {
    const itemTemplate = node.props.itemTemplate;
    const hideEmptyGroups = extractValue.asOptionalBoolean(node.props.hideEmptyGroups, true);
    return (
      <List2Native
        registerComponentApi={registerComponentApi}
        className={className}
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
                key={key}
                renderChild={renderChild}
                layoutContext={layoutContext}
                contextVars={{
                  $item: item,
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
                    renderChild={renderChild}
                    key={key}
                    contextVars={{
                      $group: item,
                    }}
                  />
                ) : null
            : undefined
        }
      />
    );
  },
);
