import { createMetadata, dComponent, dContextMenu } from "../../component-core/metadata/helpers";
import { createRuntimeScope } from "../../runtime/state";
import { nonPropertyChildren, templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Tree.defaults";
import { TreeNative, type TreeApi, type VisibleTreeItem } from "./TreeReact";

const COMP = "Tree";

const treeStylesSource = `
$backgroundColor-Tree: createThemeVar("backgroundColor-Tree");
$backgroundColor-item-Tree--hover: createThemeVar("backgroundColor-item-Tree--hover");
$backgroundColor-selected-Tree: createThemeVar("backgroundColor-selected-Tree");
$border-Tree: createThemeVar("border-Tree");
$borderRadius-Tree: createThemeVar("borderRadius-Tree");
$borderRadius-item-Tree: createThemeVar("borderRadius-item-Tree");
$itemHeight-Tree: createThemeVar("itemHeight-Tree");
$padding-Tree: createThemeVar("padding-Tree");
$textColor-Tree: createThemeVar("textColor-Tree");
$textColor-selected-Tree: createThemeVar("textColor-selected-Tree");
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
    parentIdField: { description: "The parent id field for flat data.", valueType: "string", defaultValue: defaultProps.parentIdField },
    childrenField: { description: "The children field for hierarchy data.", valueType: "string", defaultValue: defaultProps.childrenField },
    selectableField: { description: "The selectable state field.", valueType: "string", defaultValue: defaultProps.selectableField },
    selectedValue: { description: "The selected item id.", valueType: "any" },
    selectedId: { description: "Alias for selectedValue.", valueType: "any" },
    defaultExpanded: { description: "Initial expansion state.", valueType: "any", defaultValue: defaultProps.defaultExpanded },
    itemClickExpands: { description: "Whether clicking an item toggles expansion.", valueType: "boolean", defaultValue: defaultProps.itemClickExpands },
    itemTemplate: dComponent("Template used to render each tree item."),
  },
  childrenAsTemplate: "itemTemplate",
  events: {
    contextMenu: dContextMenu(COMP),
    itemClick: { description: "Fired when a tree item is clicked.", signature: "itemClick(item: any): void" },
    selectionDidChange: { description: "Fired when selection changes.", signature: "selectionDidChange(item: any): void" },
  },
  apis: {
    selectedId: { description: "The selected item id.", signature: "selectedId: any" },
    expandAll: { description: "Expands all items.", signature: "expandAll(): void" },
    collapseAll: { description: "Collapses all items.", signature: "collapseAll(): void" },
    selectId: { description: "Selects an item by id.", signature: "selectId(id: any): void" },
  },
  contextVars: {
    $item: { description: "The current tree item." },
  },
  themeVars: extractScssThemeVars(treeStylesSource),
  defaultThemeVars: {
    "backgroundColor-Tree": "$color-surface-0",
    "backgroundColor-item-Tree--hover": "$color-surface-100",
    "backgroundColor-selected-Tree": "$color-primary-100",
    "border-Tree": "none",
    "borderRadius-Tree": "$borderRadius",
    "borderRadius-item-Tree": "$borderRadius",
    "itemHeight-Tree": `${defaultProps.itemHeight}px`,
    "padding-Tree": "$space-2",
    "textColor-Tree": "$textColor-primary",
    "textColor-selected-Tree": "$textColor-primary",
  },
});

export const treeRenderer = wrapComponent({
  name: COMP,
  metadata: TreeMd,
  renderer: ({ adapter }) => {
    const data = adapter.prop("data");
    const itemTemplate = templateChildren(adapter.node, "itemTemplate") ?? nonPropertyChildren(adapter.node.children);
    return (
      <TreeNative
        {...adapter.rootAttrs()}
        ref={(api: TreeApi | null) => {
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        data={Array.isArray(data) ? data : []}
        dataFormat={adapter.stringProp("dataFormat", defaultProps.dataFormat) as "flat" | "hierarchy"}
        idField={adapter.stringProp("idField", defaultProps.idField)}
        nameField={adapter.stringProp("nameField", defaultProps.nameField)}
        parentIdField={adapter.stringProp("parentIdField", defaultProps.parentIdField)}
        childrenField={adapter.stringProp("childrenField", defaultProps.childrenField)}
        selectableField={adapter.stringProp("selectableField", defaultProps.selectableField)}
        selectedId={adapter.prop("selectedId") ?? adapter.prop("selectedValue")}
        defaultExpanded={adapter.prop("defaultExpanded", defaultProps.defaultExpanded)}
        itemClickExpands={adapter.booleanProp("itemClickExpands", defaultProps.itemClickExpands)}
        renderItem={itemTemplate.length > 0 ? (item, visibleItem: VisibleTreeItem) => {
          const itemScope = createRuntimeScope({
            store: adapter.scope.store,
            parent: adapter.scope,
            props: adapter.scope.props,
            contextValues: { $item: item, $treeItem: visibleItem },
            references: adapter.scope.references,
            slots: adapter.scope.slots,
            emitEvent: adapter.scope.emitEvent,
          });
          return adapter.context.renderChildren(itemTemplate, itemScope);
        } : undefined}
        onItemClick={(item) => void adapter.event("itemClick")(item)}
        onSelectionDidChange={(item) => void adapter.event("selectionDidChange")(item)}
      />
    );
  },
});
