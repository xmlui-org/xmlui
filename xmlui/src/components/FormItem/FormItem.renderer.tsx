import { wrapComponent } from "../../runtime/rendering/adapter";
import { FormItemMd } from "./FormItem";
import { FormItem } from "./FormItemReact";

export const formItemRenderer = wrapComponent({
  name: "FormItem",
  metadata: FormItemMd,
  renderer({ adapter }) {
    return (
      <FormItem
        {...adapter.rootAttrs()}
        id={adapter.stringProp("id")}
        bindTo={adapter.stringProp("bindTo")}
        label={adapter.stringProp("label")}
        labelPosition={adapter.stringProp("labelPosition", "top")}
        labelWidth={adapter.prop("labelWidth") as string | number | undefined}
        enabled={adapter.booleanProp("enabled", true)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        type={adapter.stringProp("type", "text")}
        initialValue={adapter.prop("initialValue")}
        required={adapter.booleanProp("required", false)}
        requiredInvalidMessage={adapter.stringProp("requiredInvalidMessage")}
        className={adapter.className}
        style={adapter.style}
      >
        {adapter.node.children.length > 0 ? adapter.renderChildren() : undefined}
      </FormItem>
    );
  },
});
