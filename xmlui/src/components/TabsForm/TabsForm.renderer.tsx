import type { XmluiElement } from "../../compiler/ir";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { TabsFormMd } from "./TabsForm";
import { TabsForm } from "./TabsFormReact";

export const tabsFormRenderer = wrapComponent({
  name: "TabsForm",
  metadata: TabsFormMd,
  renderer({ adapter }) {
    const segments = nonPropertyChildren(adapter.node.children)
      .filter((child): child is XmluiElement => child.kind === "element" && child.type === "FormSegment")
      .map((segment, index) => ({
        key: `${segment.range.start}-${index}`,
        label: segment.props.label == null ? `Step ${index + 1}` : String(segment.props.label),
        content: adapter.context.renderChildren(nonPropertyChildren(segment.children), adapter.scope),
      }));

    return (
      <TabsForm
        {...adapter.rootAttrs()}
        data={adapter.prop("data")}
        enabled={adapter.booleanProp("enabled", true)}
        saveLabel={adapter.stringProp("saveLabel", "Save")}
        cancelLabel={adapter.stringProp("cancelLabel", "Cancel")}
        hideButtonRow={adapter.booleanProp("hideButtonRow", false)}
        enableSubmit={adapter.booleanProp("enableSubmit", true)}
        tabsOrientation={adapter.stringProp("tabsOrientation", "horizontal") as "horizontal" | "vertical"}
        tabsTabAlignment={adapter.stringProp("tabsTabAlignment", "start") as "start" | "end" | "center" | "stretch"}
        tabsAccordionView={adapter.booleanProp("tabsAccordionView", false)}
        tabsDistributeEvenly={adapter.booleanProp("tabsDistributeEvenly", false)}
        tabsActiveTab={adapter.numberProp("tabsActiveTab", 0)}
        segments={segments}
        onSubmit={(values) => adapter.event("submit")(values)}
        onSubmitFailed={(errors) => adapter.event("submitFailed")(errors)}
        onCancel={() => adapter.event("cancel")()}
        registerComponentApi={adapter.registerApi}
      />
    );
  },
});
