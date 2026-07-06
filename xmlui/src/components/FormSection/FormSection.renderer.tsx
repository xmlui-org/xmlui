import { wrapComponent } from "../../runtime/rendering/adapter";
import { FormSectionMd } from "./FormSection";

export const formSectionRenderer = wrapComponent({
  name: "FormSection",
  metadata: FormSectionMd,
  renderer({ adapter }) {
    return (
      <div
        {...adapter.rootAttrs()}
        style={{
          ...adapter.style,
          display: "flex",
          flexFlow: "row wrap",
          gap: "var(--xmlui-gap-FlowLayout, var(--xmlui-space-4, 1rem))",
          alignItems: "flex-start",
        }}
      >
        {adapter.renderChildren()}
      </div>
    );
  },
});
