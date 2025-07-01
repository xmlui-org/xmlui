import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { SelectionStore, defaultProps } from "./SelectionStoreNative";

const COMP = "SelectionStore";

export const SelectionStoreMd = createMetadata({
  status: "deprecated",
  description:
    `The \`${COMP}\` is a non-visual component that may wrap components (items) and manage ` +
    `their selection state to accommodate the usage of other actions.`,
  props: {
    idKey: {
      description: `The selected items in the selection store needs to have a unique ID to use as an ` +
        `unambiguous key for that particular item. This property uniquely identifies the ` +
        `selected object item via a given property. By default, the key attribute is \`"id"\`.`,
      defaultValue: defaultProps.idKey,
    },
  },
});

export const selectionStoreComponentRenderer = createComponentRenderer(
  COMP,
  SelectionStoreMd,
  (rendererContext) => {
    const { node, state, updateState, renderChild, registerComponentApi } = rendererContext;

    return (
      <SelectionStore
        updateState={updateState}
        idKey={node.props.idKey}
        selectedItems={state?.value}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children)}
      </SelectionStore>
    );
  },
);
