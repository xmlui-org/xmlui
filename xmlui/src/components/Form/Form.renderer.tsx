import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import { FormMd } from "./Form";
import { Form } from "./FormReact";

export const formRenderer = wrapComponent({
  name: "Form",
  metadata: FormMd,
  renderer({ adapter }) {
    const buttonRowTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "buttonRowTemplate",
    )
      ? adapter.renderTemplate("buttonRowTemplate")
      : undefined;

    return (
      <Form
        {...adapter.rootAttrs()}
        id={adapter.stringProp("id")}
        data={adapter.prop("data")}
        enabled={adapter.booleanProp("enabled", true)}
        saveLabel={adapter.stringProp("saveLabel", "Save")}
        savePendingLabel={adapter.stringProp("savePendingLabel", "Validating...")}
        submitFeedbackDelay={adapter.numberProp("submitFeedbackDelay", 100)}
        cancelLabel={adapter.stringProp("cancelLabel", "Cancel")}
        hideButtonRow={adapter.booleanProp("hideButtonRow", false)}
        hideButtonRowUntilDirty={adapter.booleanProp("hideButtonRowUntilDirty", false)}
        enableSubmit={adapter.booleanProp("enableSubmit", true)}
        submitUrl={adapter.stringProp("submitUrl") ?? adapter.stringProp("submiturl")}
        submitMethod={adapter.stringProp("submitMethod") ?? adapter.stringProp("submitmethod")}
        itemLabelPosition={adapter.stringProp("itemLabelPosition")}
        itemLabelWidth={adapter.prop("itemLabelWidth")}
        itemLabelBreak={
          Object.prototype.hasOwnProperty.call(adapter.props, "itemLabelBreak")
            ? adapter.booleanProp("itemLabelBreak", false)
            : undefined
        }
        itemRequireLabelMode={adapter.stringProp("itemRequireLabelMode")}
        swapCancelAndSave={adapter.booleanProp("swapCancelAndSave", false)}
        buttonRowTemplate={buttonRowTemplate}
        className={adapter.className}
        style={adapter.style}
        renderContent={(dataContext) => {
          const formScope = createRuntimeScope({
            store: adapter.scope.store,
            parent: adapter.scope,
            props: adapter.scope.props,
            contextValues: {
              $data: dataContext,
            },
            references: adapter.scope.references,
            slots: adapter.scope.slots,
            emitEvent: adapter.scope.emitEvent,
            extensionFunctions: adapter.scope.extensionFunctions,
          });
          return adapter.context.renderChildren(nonPropertyChildren(adapter.node.children), formScope);
        }}
        onWillSubmit={(values, allValues) => adapter.event("willSubmit")(values, allValues)}
        onSubmit={(values) => adapter.event("submit")(values)}
        onSubmitFailed={(errors) => adapter.event("submitFailed")(errors)}
        onCancel={() => adapter.event("cancel")()}
        onReset={() => adapter.event("reset")()}
        onSuccess={(result) => adapter.event("success")(result)}
        onSaved={(result) => adapter.event("saved")(result)}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.renderChildren()}
      </Form>
    );
  },
});
