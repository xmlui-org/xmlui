import { createMetadata } from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./SelectionStore.defaults";
import { SelectionStoreNative } from "./SelectionStoreReact";

const COMP = "SelectionStore";

export const SelectionStoreMd = createMetadata({
  status: "deprecated",
  deprecationMessage: `The \`${COMP}\` component is deprecated and will be removed in a future release.`,
  description:
    `The \`${COMP}\` is a non-visual component that may wrap selection-aware components and manage their selection state.`,
  props: {
    id: { description: "The component id.", valueType: "string" },
    idKey: {
      description: "The property that uniquely identifies selected object items.",
      valueType: "string",
      defaultValue: defaultProps.idKey,
    },
    value: {
      description: "Selected items tracked by the store.",
      valueType: "any",
    },
  },
  apis: {
    clearSelection: { description: "Clears the current selection.", signature: "clearSelection(): void" },
    setSelectedRowIds: {
      description: "Sets selected rows by their IDs.",
      signature: "setSelectedRowIds(rowIds: any[]): void",
    },
    refreshSelection: {
      description: "Refreshes selection from the current item set.",
      signature: "refreshSelection(allItems?: any[]): void",
    },
    value: { description: "Returns selected items." },
  },
});

export const selectionStoreRenderer = wrapComponent({
  name: COMP,
  metadata: SelectionStoreMd,
  renderer: ({ adapter }) => (
    <SelectionStoreNative
      idKey={adapter.stringProp("idKey", defaultProps.idKey)}
      selectedItems={arrayValue(adapter.prop("value"))}
      registerApi={adapter.registerApi}
    >
      {adapter.renderChildren()}
    </SelectionStoreNative>
  ),
});

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : defaultProps.selectedItems;
}
