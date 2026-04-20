import { memo, useMemo, useRef, startTransition } from "react";
import { useEvent } from "../../components-core/utils/misc";
import type { MouseEvent } from "react";
import styles from "./TileGrid.module.scss";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { MemoizedItem } from "../container-helpers";
import { EMPTY_OBJECT } from "../../components-core/constants";
import { createMetadata, d, dComponent } from "../metadata-helpers";
import type { PropertyValueDescription, ComponentDef } from "../../abstractions/ComponentDefs";
import type { LayoutContext, RenderChildFn } from "../../abstractions/RendererDefs";
import { TileGridNative, defaultProps } from "./TileGridReact";
import type { CheckboxPosition } from "./TileGridReact";
import { StandaloneSelectionStore } from "../SelectionStore/SelectionStoreReact";

const COMP = "TileGrid";

const userSelectValues: PropertyValueDescription[] = [
  { value: "auto", description: "Default text selection behavior" },
  { value: "text", description: "Text can be selected by the user" },
  { value: "none", description: "Text cannot be selected" },
  { value: "contain", description: "Selection is contained within this element" },
  { value: "all", description: "The entire element content is selected as one unit" },
];

export const TileGridMd = createMetadata({
  status: "experimental",
  description:
    "`TileGrid` renders a data array as a responsive, virtualized tile grid. " +
    "It auto-calculates the number of columns based on the container width, tile width, and gap, " +
    "and only renders visible rows — making it suitable for large datasets.",

  props: {
    data: d(
      `The array of items to render as tiles. Each item is exposed as [\`$item\`](#item) ` +
        `inside the tile template.`,
    ),
    itemWidth: {
      description: "Fixed width of each tile, e.g. `\"120px\"`.",
      valueType: "string",
      defaultValue: defaultProps.itemWidth,
    },
    itemHeight: {
      description: "Fixed height of each tile, e.g. `\"140px\"`.",
      valueType: "string",
      defaultValue: defaultProps.itemHeight,
    },
    gap: {
      description: "Gap between tiles, e.g. `\"8px\"` or a theme variable like `\"$gap-normal\"`.",
      valueType: "string",
      defaultValue: defaultProps.gap,
    },
    stretchItems: {
      description:
        "When `true`, tiles in each row grow to fill the full container width. " +
        "`itemWidth` becomes the minimum tile width; the actual width is distributed evenly.",
      valueType: "boolean",
      defaultValue: defaultProps.stretchItems,
    },
    loading: {
      description:
        "When `true`, the grid shows a placeholder loading state instead of tile content.",
      valueType: "boolean",
      defaultValue: defaultProps.loading,
    },
    itemsSelectable: {
      description:
        "Enables selection mode. When `true`, tiles can be selected by clicking on them.",
      valueType: "boolean",
      defaultValue: defaultProps.itemsSelectable,
    },
    enableMultiSelection: {
      description:
        "When `true` (default), multiple tiles can be selected using Ctrl/Cmd+Click or " +
        "Shift+Click. When `false`, only a single tile can be selected at a time.",
      valueType: "boolean",
      defaultValue: defaultProps.enableMultiSelection,
    },
    toggleSelectionOnClick: {
      description:
        "When `true`, a plain click toggles the tile's selection state instead of replacing " +
        "the current selection. Ctrl+Click and Shift+Click behavior is unchanged. " +
        "Only has an effect when `itemsSelectable` is `true`.",
      valueType: "boolean",
      defaultValue: defaultProps.toggleSelectionOnClick,
    },
    syncWithVar: d(
      `The name of a global variable to synchronize the grid's selection state with. ` +
        `The named variable must reference an object; the grid will read from and write to its \`selectedIds\` property. A runtime error is signalled if the value is not a valid JavaScript variable name.`,
    ),
    refreshOn: d(
      `An optional value that, when changed, forces all visible tiles to re-render so their ` +
        `XMLUI event-handler closures pick up the latest reactive state. Bind to any global ` +
        `variable whose change should invalidate tile closures (e.g. \`"{selectMode}"\`). ` +
        `If not provided, tiles re-render on every XMLUI reactive cycle.`,
    ),
    hideSelectionCheckboxes: {
      description:
        "If `true`, hides selection checkboxes. Selection logic still works via click, API, and keyboard.",
      valueType: "boolean",
      defaultValue: defaultProps.hideSelectionCheckboxes,
    },
    checkboxPosition: {
      description:
        "Controls the position of the per-tile selection checkbox relative to the tile, " +
        "respecting the current writing direction.",
      valueType: "string",
      availableValues: [
        { value: "topStart", description: "Top of the tile, writing-direction start edge." },
        { value: "topEnd", description: "Top of the tile, writing-direction end edge." },
        { value: "bottomStart", description: "Bottom of the tile, writing-direction start edge." },
        { value: "bottomEnd", description: "Bottom of the tile, writing-direction end edge." },
      ],
      defaultValue: defaultProps.checkboxPosition,
    },
    idKey: {
      description:
        "The property name used as the unique identifier for each item. " +
        "Used to track selection state.",
      valueType: "string",
      defaultValue: defaultProps.idKey,
    },
    itemUserSelect: {
      description: `This property controls whether users can select text within tiles.`,
      valueType: "string",
      availableValues: userSelectValues,
      defaultValue: defaultProps.itemUserSelect,
    },
    itemTemplate: dComponent(
      `The template used to render each tile. Use the [\`$item\`](#item) context variable to ` +
        `access the current data item, [\`$itemIndex\`](#itemIndex) for the zero-based index, ` +
        `and [\`$selected\`](#selected) to respond to the tile's selection state.`,
    ),
  },

  events: {
    selectionDidChange: d(
      "Fired when the selection changes. Receives the array of currently selected items.",
    ),
    itemDoubleClick: d("Fired when a tile is double-clicked. Receives the data item."),
    cutAction: d(
      "Fired when the user presses Ctrl/Cmd+X. " +
        "Receives `(focusedItem, selectedItems, selectedIds)`.",
    ),
    copyAction: d(
      "Fired when the user presses Ctrl/Cmd+C. " +
        "Receives `(focusedItem, selectedItems, selectedIds)`.",
    ),
    pasteAction: d(
      "Fired when the user presses Ctrl/Cmd+V. " +
        "Receives `(focusedItem, selectedItems, selectedIds)`.",
    ),
    deleteAction: d(
      "Fired when the user presses the Delete key. " +
        "Receives `(focusedItem, selectedItems, selectedIds)`.",
    ),
    selectAllAction: d(
      "Fired when the user presses Ctrl/Cmd+A. Receives `(selectedItems, selectedIds)`.",
    ),
    contextMenu: d(
      "Fired when a tile is right-clicked. Receives the tile data item as `$item` and its zero-based index as `$itemIndex`.",
    ),
  },

  contextVars: {
    $item: d("The current data item."),
    $itemIndex: d("The zero-based index of the current item in the full `data` array."),
    $isFirst: d("`true` when this is the first item in the `data` array."),
    $isLast: d("`true` when this is the last item in the `data` array."),
    $selected: d("`true` when this tile is currently selected."),
  },

  childrenAsTemplate: "itemTemplate",

  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-item-${COMP}`]: "transparent",
    [`backgroundColor-item-${COMP}--hover`]: "$color-surface-100",
    [`backgroundColor-item-${COMP}--selected`]: "$color-surface-100",
    [`backgroundColor-item-${COMP}--selected--hover`]: "$color-primary-100",
    [`borderRadius-item-${COMP}`]: "$borderRadius",
    [`offsetVertical-checkbox-${COMP}`]: "4px",
    [`offsetHorizontal-checkbox-${COMP}`]: "4px",
    [`userSelect-item-${COMP}`]: "none",
    [`outlineColor-item-${COMP}--focus`]: "$color-primary-500",
    [`outlineWidth-item-${COMP}--focus`]: "2px",
    [`outlineStyle-item-${COMP}--focus`]: "solid",
    [`outlineOffset-item-${COMP}--focus`]: "-2px",
    [`fontSize-checkbox-${COMP}`]: "$fontSize",
  },
});

// TileGrid-specific memoized tile. Uses a custom comparator so that:
//   - renderVersion change  → always re-render (external XMLUI reactive cycle)
//   - contextVars value change → re-render (e.g. $selected toggled for this tile)
//   - everything else stable  → skip re-render
// Kept separate from the shared MemoizedItem to avoid affecting other consumers.
type TileGridItemProps = {
  node: ComponentDef | Array<ComponentDef>;
  renderChild: RenderChildFn;
  layoutContext?: LayoutContext;
  contextVars?: Record<string, any>;
  renderVersion: number;
};

const TileGridMemoizedItem = memo(
  ({ node, renderChild, layoutContext, contextVars }: TileGridItemProps) => {
    return (
      <MemoizedItem
        node={node}
        renderChild={renderChild}
        layoutContext={layoutContext}
        contextVars={contextVars}
      />
    );
  },
  (prev, next) => {
    if (prev.renderVersion !== next.renderVersion) return false;
    if (prev.node !== next.node) return false;
    // renderChild and layoutContext are stable refs — no need to compare
    const prevVars = prev.contextVars ?? EMPTY_OBJECT;
    const nextVars = next.contextVars ?? EMPTY_OBJECT;
    const keys = Object.keys(nextVars);
    if (keys.length !== Object.keys(prevVars).length) return false;
    for (const k of keys) {
      if (prevVars[k] !== nextVars[k]) return false;
    }
    return true;
  },
);

const VALID_IDENTIFIER_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

const TileGridWithSync = memo(
  ({ node, extractValue, renderChild, classes, layoutContext, lookupEventHandler, lookupAction, registerComponentApi }: any) => {
    const itemTemplate = node.props.itemTemplate;
    const idKey = extractValue.asOptionalString(node.props.idKey) ?? defaultProps.idKey;
    const syncVarName = extractValue.asOptionalString(node.props.syncWithVar);

    // Keep lookupAction current without breaking the stable adapter reference (same pattern as Table).
    const lookupActionRef = useRef(lookupAction);
    lookupActionRef.current = lookupAction;
    // Keep lookupEventHandler current so the stable onContextMenuItem closure always uses the latest.
    const lookupEventHandlerRef = useRef(lookupEventHandler);
    lookupEventHandlerRef.current = lookupEventHandler;
    const syncAdapterHolderRef = useRef<{ value: any; update: any } | null>(null);

    // renderVersion increments only when refreshOn changes (app-declared external state
    // that affects tile closures, e.g. selectMode). This avoids full-grid re-renders from
    // the XMLUI reactive cycles that fire on every click/focus event.
    // If refreshOn is not provided, we increment on every XMLUI cycle for safety.
    const refreshOn = extractValue(node.props.refreshOn);
    const prevRefreshOnRef = useRef<unknown>(refreshOn);
    const renderVersionRef = useRef(0);

    // pendingOwnWriteRef: set to true just before syncAdapter.update calls handler().
    // Consumed at the top of each render to detect own-write XMLUI cycles and suppress
    // the resulting TileGridNative re-render (in-place syncAdapter update instead of new object).
    // pendingOwnWriteVersionRef + __v: monotonically-increasing version embedded in the window
    // object so own-write detection survives concurrent React re-renders (startTransition may
    // cause multiple render attempts; a boolean flag would be consumed on the first and missed
    // on the second, incorrectly treating the repeat as an external change).
    const pendingOwnWriteRef = useRef(false);
    const pendingOwnWriteVersionRef = useRef<number>(0);
    const ownWriteCountRef = useRef<number>(0);
    const pendingOwnWrite = pendingOwnWriteRef.current;
    pendingOwnWriteRef.current = false;

    const shouldForceRefresh = node.props.refreshOn === undefined || prevRefreshOnRef.current !== refreshOn;
    if (shouldForceRefresh) {
      prevRefreshOnRef.current = refreshOn;
      renderVersionRef.current++;
    }

    let syncAdapter: any;
    if (syncVarName !== undefined) {
      if (!VALID_IDENTIFIER_RE.test(syncVarName)) {
        console.error(`[TileGrid syncWithVar] Invalid variable name: "${syncVarName}"`);
        syncAdapterHolderRef.current = null;
      } else {
        const currentValue = extractValue(`{${syncVarName}}`);
        if (currentValue != null) {
          if (!syncAdapterHolderRef.current) {
            syncAdapterHolderRef.current = {
              value: currentValue,
              update: ({ selectedIds }: { selectedIds: string[] }) => {
                const windowKey = `__tgSync_${syncVarName}`;
                pendingOwnWriteRef.current = true;
                const thisVersion = ++ownWriteCountRef.current;
                pendingOwnWriteVersionRef.current = thisVersion;
                (window as any)[windowKey] = { selectedIds, __v: thisVersion };
                const handler = lookupActionRef.current?.(
                  `{${syncVarName} = {selectedIds: window.${windowKey}.selectedIds, __v: window.${windowKey}.__v}}`,
                  { ephemeral: true },
                );
                startTransition(() => { handler?.(); });
              },
            };
          } else if (currentValue !== syncAdapterHolderRef.current.value) {
            const isOwnWrite = pendingOwnWrite ||
              (pendingOwnWriteVersionRef.current > 0 &&
                currentValue?.__v === pendingOwnWriteVersionRef.current);
            if (isOwnWrite) {
              // Own-write cycle: update value in-place so TileGridNative.memo() is not triggered.
              syncAdapterHolderRef.current.value = currentValue;
              if (currentValue?.__v === pendingOwnWriteVersionRef.current) {
                pendingOwnWriteVersionRef.current = 0; // version consumed
              }
            } else {
              // External change (select-all etc.): new object so TileGridNative.memo() detects it.
              syncAdapterHolderRef.current = {
                value: currentValue,
                update: syncAdapterHolderRef.current.update,
              };
            }
          }
        } else {
          syncAdapterHolderRef.current = null;
        }
      }
    } else {
      syncAdapterHolderRef.current = null;
    }
    syncAdapter = syncAdapterHolderRef.current;

    // Keep renderChild and layoutContext in refs so stable wrappers can always
    // call the latest version without changing their own reference.
    const renderChildRef = useRef(renderChild);
    renderChildRef.current = renderChild;
    const layoutContextRef = useRef(layoutContext);
    layoutContextRef.current = layoutContext;

    // Stable function wrappers: created once, never reassigned, always delegate
    // to the latest ref value. MemoizedItem's comparator receives the same
    // reference every render, so it never fails on renderChild/layoutContext.
    const stableRenderChildFnRef = useRef<typeof renderChild>(
      (node: any, ctx: any) => renderChildRef.current(node, ctx),
    );

    // Stable contextMenu handler — evaluated ephemeral at click time so the XMLUI expression
    // always runs with a fresh reactive snapshot (same mechanism as Table's onContextMenu).
    // Only recreated if the presence of the onContextMenu attribute changes.
    const hasContextMenu = !!node.events?.contextMenu;
    const onContextMenuItem = useMemo(
      () =>
        hasContextMenu
          ? (item: any, index: number, event: MouseEvent) => {
              event.preventDefault();
              const handler = lookupEventHandlerRef.current?.("contextMenu", {
                context: { $item: item, $itemIndex: index },
                ephemeral: true,
              });
              handler?.(event);
            }
          : undefined,
      [hasContextMenu],
    );

    const stableSelectionDidChange = useEvent((...args: any[]) => lookupEventHandler("selectionDidChange")?.(...args));
    const stableItemDoubleClick = useEvent((...args: any[]) => lookupEventHandler("itemDoubleClick")?.(...args));
    const stableCutAction = useEvent((...args: any[]) => lookupEventHandler("cutAction")?.(...args));
    const stableCopyAction = useEvent((...args: any[]) => lookupEventHandler("copyAction")?.(...args));
    const stablePasteAction = useEvent((...args: any[]) => lookupEventHandler("pasteAction")?.(...args));
    const stableDeleteAction = useEvent((...args: any[]) => lookupEventHandler("deleteAction")?.(...args));
    const stableSelectAllAction = useEvent((...args: any[]) => lookupEventHandler("selectAllAction")?.(...args));

    const stableItemRenderer = useMemo(
      () =>
        itemTemplate
          ? (item: any, index: number, count: number, selected: boolean) => (
              <TileGridMemoizedItem
                node={itemTemplate as ComponentDef}
                key={`${item?.[idKey] ?? index}`}
                renderChild={stableRenderChildFnRef.current}
                layoutContext={layoutContextRef.current}
                renderVersion={renderVersionRef.current}
                contextVars={{
                  $item: item,
                  $itemIndex: index,
                  $isFirst: index === 0,
                  $isLast: index === count - 1,
                  $selected: selected,
                }}
              />
            )
          : undefined,
      [itemTemplate, idKey],
    );

    const content = (
      <TileGridNative
        registerComponentApi={registerComponentApi}
        classes={classes}
        data={extractValue(node.props.data)}
        itemWidth={extractValue.asOptionalString(node.props.itemWidth)}
        itemHeight={extractValue.asOptionalString(node.props.itemHeight)}
        gap={extractValue.asSize(node.props.gap) ?? defaultProps.gap}
        stretchItems={extractValue.asOptionalBoolean(node.props.stretchItems)}
        loading={extractValue.asOptionalBoolean(node.props.loading)}
        itemsSelectable={extractValue.asOptionalBoolean(node.props.itemsSelectable)}
        enableMultiSelection={extractValue.asOptionalBoolean(node.props.enableMultiSelection)}
        toggleSelectionOnClick={extractValue.asOptionalBoolean(node.props.toggleSelectionOnClick)}
        syncWithAppState={syncAdapter}
        checkboxPosition={extractValue.asOptionalString(node.props.checkboxPosition) as CheckboxPosition}
        hideSelectionCheckboxes={extractValue.asOptionalBoolean(node.props.hideSelectionCheckboxes)}
        idKey={idKey}
        itemUserSelect={extractValue.asOptionalString(node.props.itemUserSelect)}
        renderVersion={renderVersionRef.current}
        onSelectionDidChange={stableSelectionDidChange}
        onItemDoubleClick={node.events?.itemDoubleClick ? stableItemDoubleClick : undefined}
        onCutAction={node.events?.cutAction ? stableCutAction : undefined}
        onCopyAction={node.events?.copyAction ? stableCopyAction : undefined}
        onPasteAction={node.events?.pasteAction ? stablePasteAction : undefined}
        onDeleteAction={node.events?.deleteAction ? stableDeleteAction : undefined}
        onSelectAllAction={node.events?.selectAllAction ? stableSelectAllAction : undefined}
        onContextMenuItem={onContextMenuItem}
        itemRenderer={stableItemRenderer}
      />
    );

    return <StandaloneSelectionStore idKey={idKey}>{content}</StandaloneSelectionStore>;
  },
);

export const tileGridComponentRenderer = wrapComponent(
  COMP,
  TileGridNative,
  TileGridMd,
  {
    exposeRegisterApi: true,
    exclude: [
      "data", "itemWidth", "itemHeight", "gap", "stretchItems", "loading", "itemsSelectable",
      "enableMultiSelection", "toggleSelectionOnClick", "syncWithVar", "refreshOn", "checkboxPosition", "hideSelectionCheckboxes",
      "idKey", "itemUserSelect", "itemTemplate",
    ],
    events: [],
    customRender: (_props, { node, extractValue, renderChild, classes, layoutContext, lookupEventHandler, lookupAction, registerComponentApi }) => (
      <TileGridWithSync
        node={node}
        extractValue={extractValue}
        lookupEventHandler={lookupEventHandler as any}
        lookupAction={lookupAction}
        classes={classes}
        renderChild={renderChild}
        registerComponentApi={registerComponentApi}
        layoutContext={layoutContext}
      />
    ),
  },
);
