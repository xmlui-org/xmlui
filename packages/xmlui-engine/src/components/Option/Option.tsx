import { useEffect, useId } from "react";

import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { Option } from "@components/abstractions";
import { createComponentRenderer } from "@components-core/renderers";
import { useSelectContext } from "@components/Select/SelectContext";
import { MemoizedItem } from "@components/container-helpers";

function OptionComponent(props: Option) {
  const id = useId();
  const { register, unRegister } = useSelectContext();
  useEffect(() => {
    register({
      ...props,
      id,
    });
  }, [id, props, register]);
  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);
  return null;
}

// =====================================================================================================================
// XMLUI Option component definition

/**
 * \`Option\` is a non-visual component describing a selection option. Other components (such as \`Select\`,
 * \`Combobox\`, and others) may use nested \`Option\` instances from which the user can select.
 */
export interface OptionComponentDef extends ComponentDef<"Option"> {
  props: {
    /** @descriptionRef */
    label: string;
    /** @descriptionRef */
    value: string;
    /** @descriptionRef */
    disabled?: string;
  };
}

export const optionComponentRenderer = createComponentRenderer<OptionComponentDef>("Option", (rendererContext) => {
  const { node, renderChild, extractValue } = rendererContext;
  let label= extractValue(node.props.label);
  let value = extractValue(node.props.value);
  if (label == undefined && value == undefined) {
    return null;
  }
  if (label != undefined && value == undefined) {
    value = label;
  } else if (label == undefined && value != undefined) {
    label = value;
  }
  return (
    <OptionComponent
      value={value}
      label={label}
      disabled={extractValue.asOptionalBoolean(node.props.disabled)}
      renderer={
        node.children?.length
          ? (item: any) => {
              return <MemoizedItem node={node.children!} item={item} renderChild={renderChild} />;
            }
          : undefined
      }
    />
  );
});
