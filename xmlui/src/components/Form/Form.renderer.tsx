import { wrapComponent } from "../../runtime/rendering/adapter";
import { FormMd } from "./Form";
import { Form } from "./FormReact";

export const formRenderer = wrapComponent({
  name: "Form",
  metadata: FormMd,
  renderer({ adapter }) {
    return (
      <Form
        {...adapter.rootAttrs()}
        id={adapter.stringProp("id")}
        data={adapter.prop("data")}
        enabled={adapter.booleanProp("enabled", true)}
        saveLabel={adapter.stringProp("saveLabel", "Save")}
        cancelLabel={adapter.stringProp("cancelLabel", "Cancel")}
        hideButtonRow={adapter.booleanProp("hideButtonRow", false)}
        enableSubmit={adapter.booleanProp("enableSubmit", true)}
        className={adapter.className}
        style={adapter.style}
        onSubmit={(values) => adapter.event("submit")(values)}
        onSubmitFailed={(errors) => adapter.event("submitFailed")(errors)}
        onCancel={() => adapter.event("cancel")()}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.renderChildren()}
      </Form>
    );
  },
});
