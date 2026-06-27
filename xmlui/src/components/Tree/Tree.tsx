import { createMetadata, dComponent, dContextMenu } from "../../component-core/metadata/helpers";
import { createRuntimeScope } from "../../runtime/state";
import { nonPropertyChildren, templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { runEvent } from "../../runtime/rendering/bindings";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Tree.defaults";
import { TreeNative, type TreeApi, type VisibleTreeItem } from "./TreeReact";

const COMP = "Tree";

const treeStylesSource = `
$backgroundColor-Tree: createThemeVar("backgroundColor-Tree");
$backgroundColor-item-Tree--hover: createThemeVar("backgroundColor-item-Tree--hover");
$backgroundColor-Tree-row--hover: createThemeVar("backgroundColor-Tree-row--hover");
$backgroundColor-selected-Tree: createThemeVar("backgroundColor-selected-Tree");
$backgroundColor-Tree-row--selected: createThemeVar("backgroundColor-Tree-row--selected");
$border-Tree: createThemeVar("border-Tree");
$borderRadius-Tree: createThemeVar("borderRadius-Tree");
$borderRadius-item-Tree: createThemeVar("borderRadius-item-Tree");
$itemHeight-Tree: createThemeVar("itemHeight-Tree");
$outlineColor-Tree--focus: createThemeVar("outlineColor-Tree--focus");
$outlineWidth-Tree--focus: createThemeVar("outlineWidth-Tree--focus");
$padding-Tree: createThemeVar("padding-Tree");
$textColor-Tree: createThemeVar("textColor-Tree");
$textColor-selected-Tree: createThemeVar("textColor-selected-Tree");
$textColor-Tree--hover: createThemeVar("textColor-Tree--hover");
$textColor-Tree--selected: createThemeVar("textColor-Tree--selected");
`;

export const TreeMd = createMetadata({
  status: "experimental",
  description: "`Tree` displays hierarchical data with expansion and selection.",
  optimization: { isImplicitContainerByDefault: true },
  props: {
    data: { description: "The data source of the tree.", valueType: "any" },
    dataFormat: { description: "The input data format.", valueType: "string", defaultValue: defaultProps.dataFormat },
    idField: { description: "The item id field.", valueType: "string", defaultValue: defaultProps.idField },
    nameField: { description: "The item display field.", valueType: "string", defaultValue: defaultProps.nameField },
    iconField: { description: "The item icon field.", valueType: "string", defaultValue: defaultProps.iconField },
    iconExpandedField: { description: "The expanded icon field.", valueType: "string", defaultValue: defaultProps.iconExpandedField },
    iconCollapsedField: { description: "The collapsed icon field.", valueType: "string", defaultValue: defaultProps.iconCollapsedField },
    parentIdField: { description: "The parent id field for flat data.", valueType: "string", defaultValue: defaultProps.parentIdField },
    childrenField: { description: "The children field for hierarchy data.", valueType: "string", defaultValue: defaultProps.childrenField },
    selectableField: { description: "The selectable state field.", valueType: "string", defaultValue: defaultProps.selectableField },
    dynamicField: { description: "The item dynamic loading field.", valueType: "string", defaultValue: defaultProps.dynamicField },
    loadedField: { description: "The item loaded state field.", valueType: "string", defaultValue: defaultProps.loadedField },
    dynamic: { description: "Default dynamic loading state for items.", valueType: "boolean", defaultValue: defaultProps.dynamic },
    autoLoadAfterField: { description: "The item auto-load threshold field.", valueType: "string", defaultValue: defaultProps.autoLoadAfterField },
    autoLoadAfter: { description: "Default auto-load threshold in milliseconds.", valueType: "number", defaultValue: defaultProps.autoLoadAfter },
    spinnerDelay: { description: "Delay before showing the loading spinner.", valueType: "number", defaultValue: defaultProps.spinnerDelay },
    selectedValue: { description: "The selected item id.", valueType: "any" },
    selectedId: { description: "Alias for selectedValue.", valueType: "any" },
    defaultExpanded: { description: "Initial expansion state.", valueType: "any", defaultValue: defaultProps.defaultExpanded },
    autoExpandToSelection: { description: "Automatically expands the path to the selected item.", valueType: "boolean", defaultValue: defaultProps.autoExpandToSelection },
    itemClickExpands: { description: "Whether clicking an item toggles expansion.", valueType: "boolean", defaultValue: defaultProps.itemClickExpands },
    iconCollapsed: { description: "The collapsed toggle icon.", valueType: "string", defaultValue: defaultProps.iconCollapsed },
    iconExpanded: { description: "The expanded toggle icon.", valueType: "string", defaultValue: defaultProps.iconExpanded },
    iconSize: { description: "The toggle icon size.", valueType: "string", defaultValue: defaultProps.iconSize },
    itemHeight: { description: "The height of each tree row in pixels.", valueType: "number", defaultValue: defaultProps.itemHeight },
    scrollStyle: { description: "The scrollbar style.", valueType: "string", defaultValue: defaultProps.scrollStyle },
    showScrollerFade: { description: "Shows top and bottom scroll fade indicators.", valueType: "boolean", defaultValue: defaultProps.showScrollerFade },
    overflow: { description: "Overrides the tree scroll container overflow style.", valueType: "string" },
    itemTemplate: dComponent("Template used to render each tree item."),
  },
  childrenAsTemplate: "itemTemplate",
  events: {
    contextMenu: dContextMenu(COMP),
    itemClick: { description: "Fired when a tree item is clicked.", signature: "itemClick(item: any): void" },
    selectionDidChange: { description: "Fired when selection changes.", signature: "selectionDidChange(event: any): void" },
    nodeDidExpand: { description: "Fired when a tree node expands.", signature: "nodeDidExpand(node: any): void" },
    nodeDidCollapse: { description: "Fired when a tree node collapses.", signature: "nodeDidCollapse(node: any): void" },
    loadChildren: { description: "Called to load children for a dynamic node.", signature: "loadChildren(node: any): any[]" },
  },
  apis: {
    selectedId: { description: "The selected item id.", signature: "selectedId: any" },
    expandAll: { description: "Expands all items.", signature: "expandAll(): void" },
    collapseAll: { description: "Collapses all items.", signature: "collapseAll(): void" },
    selectId: { description: "Selects an item by id.", signature: "selectId(id: any): void" },
    selectNode: { description: "Selects an item by id.", signature: "selectNode(id: any): void" },
    clearSelection: { description: "Clears tree selection.", signature: "clearSelection(): void" },
    expandNode: { description: "Expands a node by id.", signature: "expandNode(id: any): void" },
    collapseNode: { description: "Collapses a node by id.", signature: "collapseNode(id: any): void" },
    expandToLevel: { description: "Expands all nodes before the specified zero-based level.", signature: "expandToLevel(level: number): void" },
    getExpandedNodes: { description: "Returns the expanded node ids.", signature: "getExpandedNodes(): any[]" },
    getSelectedNode: { description: "Returns the selected node.", signature: "getSelectedNode(): any" },
    getVisibleItems: { description: "Returns currently visible tree items.", signature: "getVisibleItems(): any[]" },
    scrollIntoView: { description: "Scrolls to a node and expands its ancestors.", signature: "scrollIntoView(id: any): void" },
    scrollToItem: { description: "Scrolls the tree to a visible item.", signature: "scrollToItem(id: any): void" },
    appendNode: { description: "Appends a node under a parent or at the root.", signature: "appendNode(parentId: any, nodeData: any): void" },
    removeNode: { description: "Removes a node and its descendants.", signature: "removeNode(id: any): void" },
    removeChildren: { description: "Removes all descendants of a node.", signature: "removeChildren(id: any): void" },
    insertNodeBefore: { description: "Inserts a node before another node.", signature: "insertNodeBefore(beforeId: any, nodeData: any): void" },
    insertNodeAfter: { description: "Inserts a node after another node.", signature: "insertNodeAfter(afterId: any, nodeData: any): void" },
    replaceNode: { description: "Replaces node properties by id.", signature: "replaceNode(id: any, nodeData: any): void" },
    replaceChildren: { description: "Replaces node children by id.", signature: "replaceChildren(id: any, newChildren: any[]): void" },
    refreshData: { description: "Refreshes internal tree data processing.", signature: "refreshData(): void" },
    getNodeById: { description: "Returns a tree node by id.", signature: "getNodeById(id: any): any" },
    getDynamic: { description: "Returns whether a node is dynamic.", signature: "getDynamic(id: any): boolean" },
    setDynamic: { description: "Sets whether a node is dynamic.", signature: "setDynamic(id: any, dynamic: boolean): void" },
    getNodeLoadingState: { description: "Returns a node loading state.", signature: "getNodeLoadingState(id: any): string" },
    setNodeLoaded: { description: "Sets a node loaded state.", signature: "setNodeLoaded(id: any, loaded: boolean): void" },
    markNodeLoaded: { description: "Marks a node as loaded.", signature: "markNodeLoaded(id: any): void" },
    markNodeUnloaded: { description: "Marks a node as unloaded.", signature: "markNodeUnloaded(id: any): void" },
    getExpandedTimestamp: { description: "Returns the last expanded timestamp for a node.", signature: "getExpandedTimestamp(id: any): number" },
    setAutoLoadAfter: { description: "Sets a node auto-load threshold.", signature: "setAutoLoadAfter(id: any, milliseconds: number): void" },
    getAutoLoadAfter: { description: "Returns a node auto-load threshold.", signature: "getAutoLoadAfter(id: any): number" },
    getNodeAutoLoadAfter: { description: "Returns a node auto-load threshold.", signature: "getNodeAutoLoadAfter(id: any): number" },
  },
  contextVars: {
    $item: { description: "The current tree item." },
  },
  themeVars: extractScssThemeVars(treeStylesSource),
  defaultThemeVars: {
    "backgroundColor-Tree": "$color-surface-0",
    "backgroundColor-item-Tree--hover": "$color-surface-100",
    "backgroundColor-Tree-row--hover": "$color-surface-100",
    "backgroundColor-selected-Tree": "$color-primary-100",
    "backgroundColor-Tree-row--selected": "$color-primary-100",
    "border-Tree": "none",
    "borderRadius-Tree": "$borderRadius",
    "borderRadius-item-Tree": "$borderRadius",
    "itemHeight-Tree": `${defaultProps.itemHeight}px`,
    "outlineColor-Tree--focus": "$color-primary-500",
    "outlineWidth-Tree--focus": "2px",
    "padding-Tree": "$space-2",
    "textColor-Tree": "$textColor-primary",
    "textColor-selected-Tree": "$textColor-primary",
    "textColor-Tree--hover": "$textColor-primary",
    "textColor-Tree--selected": "$textColor-primary",
  },
});

export const treeRenderer = wrapComponent({
  name: COMP,
  metadata: TreeMd,
  renderer: ({ adapter }) => {
    const data = adapter.prop("data");
    const itemTemplate = templateChildren(adapter.node, "itemTemplate") ?? nonPropertyChildren(adapter.node.children);
    const emitNodeEvent = (name: string, item: unknown, args: unknown[] = [item]) => {
      const itemScope = createRuntimeScope({
        store: adapter.scope.store,
        parent: adapter.scope,
        props: adapter.scope.props,
        contextValues: { $item: item },
        references: adapter.scope.references,
        slots: adapter.scope.slots,
        emitEvent: adapter.scope.emitEvent,
      });
      return runEvent(adapter.node.parsed?.events?.[name], itemScope, args);
    };
    return (
      <TreeNative
        {...adapter.rootAttrs()}
        ref={(api: TreeApi | null) => {
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        registerApi={adapter.registerApi}
        data={Array.isArray(data) ? data : []}
        dataFormat={adapter.stringProp("dataFormat", defaultProps.dataFormat) as "flat" | "hierarchy"}
        idField={adapter.stringProp("idField", defaultProps.idField)}
        nameField={adapter.stringProp("nameField", defaultProps.nameField)}
        iconField={adapter.stringProp("iconField", defaultProps.iconField)}
        iconExpandedField={adapter.stringProp("iconExpandedField", defaultProps.iconExpandedField)}
        iconCollapsedField={adapter.stringProp("iconCollapsedField", defaultProps.iconCollapsedField)}
        parentIdField={adapter.stringProp("parentIdField", defaultProps.parentIdField)}
        childrenField={adapter.stringProp("childrenField", defaultProps.childrenField)}
        selectableField={adapter.stringProp("selectableField", defaultProps.selectableField)}
        dynamicField={adapter.stringProp("dynamicField", defaultProps.dynamicField)}
        loadedField={adapter.stringProp("loadedField", defaultProps.loadedField)}
        dynamic={adapter.booleanProp("dynamic", defaultProps.dynamic)}
        autoLoadAfterField={adapter.stringProp("autoLoadAfterField", defaultProps.autoLoadAfterField)}
        autoLoadAfter={adapter.prop("autoLoadAfter") === undefined ? undefined : adapter.numberProp("autoLoadAfter", defaultProps.autoLoadAfter ?? 0)}
        spinnerDelay={adapter.numberProp("spinnerDelay", defaultProps.spinnerDelay)}
        selectedId={adapter.prop("selectedId") ?? adapter.prop("selectedValue")}
        defaultExpanded={adapter.prop("defaultExpanded", defaultProps.defaultExpanded)}
        autoExpandToSelection={adapter.booleanProp("autoExpandToSelection", defaultProps.autoExpandToSelection)}
        itemClickExpands={adapter.booleanProp("itemClickExpands", defaultProps.itemClickExpands)}
        iconCollapsed={adapter.stringProp("iconCollapsed", defaultProps.iconCollapsed)}
        iconExpanded={adapter.stringProp("iconExpanded", defaultProps.iconExpanded)}
        iconSize={adapter.stringProp("iconSize", defaultProps.iconSize)}
        itemHeight={adapter.numberProp("itemHeight", defaultProps.itemHeight)}
        scrollStyle={adapter.stringProp("scrollStyle", defaultProps.scrollStyle) as "normal" | "overlay" | "whenMouseOver" | "whenScrolling"}
        showScrollerFade={adapter.booleanProp("showScrollerFade", defaultProps.showScrollerFade)}
        overflow={adapter.stringProp("overflow")}
        renderItem={itemTemplate.length > 0 ? (item, visibleItem: VisibleTreeItem) => {
          const itemScope = createRuntimeScope({
            store: adapter.scope.store,
            parent: adapter.scope,
            props: adapter.scope.props,
            contextValues: { $item: item, $treeItem: visibleItem, $isExpanded: visibleItem.expanded },
            references: adapter.scope.references,
            slots: adapter.scope.slots,
            emitEvent: adapter.scope.emitEvent,
          });
          return adapter.context.renderChildren(itemTemplate, itemScope);
        } : undefined}
        onItemClick={adapter.node.events.itemClick ? ((item) => void adapter.event("itemClick")(item)) : undefined}
        onSelectionDidChange={adapter.node.events.selectionDidChange ? ((item) => void adapter.event("selectionDidChange")(item)) : undefined}
        onNodeDidExpand={adapter.node.events.nodeDidExpand ? ((item) => void adapter.event("nodeDidExpand")(item)) : undefined}
        onNodeDidCollapse={adapter.node.events.nodeDidCollapse ? ((item) => void adapter.event("nodeDidCollapse")(item)) : undefined}
        onLoadChildren={adapter.node.events.loadChildren ? ((item) => adapter.event("loadChildren")(item) as Promise<unknown[] | undefined>) : undefined}
        onContextMenu={adapter.node.events.contextMenu ? ((item, event) => void emitNodeEvent("contextMenu", item, [event])) : undefined}
      />
    );
  },
});
