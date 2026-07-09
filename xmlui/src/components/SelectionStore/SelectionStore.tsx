import { wrapComponent } from "../../components-core/wrapComponent";
import React, { useEffect, useState } from "react";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./SelectionStore.defaults";
import { SelectionStore } from "./SelectionStoreReact";

const COMP = "SelectionStore";

export const SelectionStoreMd = createMetadata({
  status: "deprecated",
  deprecationMessage: `The \`${COMP}\` component is deprecated and will be removed in a future release.`,
  description:
    `The \`${COMP}\` is a non-visual component that may wrap components (items) and manage ` +
    `their selection state to accommodate the usage of other actions.`,
  props: {
    idKey: {
      description: `The selected items in the selection store needs to have a unique ID to use as an ` +
        `unambiguous key for that particular item. This property uniquely identifies the ` +
        `selected object item via a given property. By default, the key attribute is \`"id"\`.`,
      valueType: "string",
      defaultValue: defaultProps.idKey,
    },
  },
});

export const selectionStoreComponentRenderer = wrapComponent(COMP, SelectionStore, SelectionStoreMd, {
  customRender: (_props, { node, state, updateState, extractValue, renderChild, registerComponentApi }) => (
    <SelectionStore
      updateState={updateState}
      idKey={extractValue.asOptionalString(node.props.idKey)}
      selectedItems={state?.value}
      registerComponentApi={registerComponentApi}
    >
      {renderChild(node.children)}
    </SelectionStore>
  ),
});

export const selectionStoreRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: SelectionStoreMd as ComponentMetadata,
  renderer: ({ adapter }) => <SelectionStoreRuntime adapter={adapter} />,
});

function SelectionStoreRuntime({ adapter }: { adapter: XmluiComponentAdapter }) {
  const [state, setState] = useState(() => ({
    value: arrayValue(adapter.prop("value", defaultProps.selectedItems)),
  }));
  const selectedItems = arrayValue(state.value);

  useEffect(() => {
    setState({ value: arrayValue(adapter.prop("value", defaultProps.selectedItems)) });
  }, [adapter.props.value]);

  useEffect(() => {
    adapter.registerApi({ value: selectedItems });
  }, [adapter, selectedItems]);

  return (
    <SelectionStore
      updateState={setState}
      idKey={adapter.stringProp("idKey", defaultProps.idKey)}
      selectedItems={selectedItems}
      registerComponentApi={adapter.registerApi}
    >
      {adapter.renderChildren()}
    </SelectionStore>
  );
}

function arrayValue(value: unknown): any[] {
  return Array.isArray(value) ? value : defaultProps.selectedItems;
}
