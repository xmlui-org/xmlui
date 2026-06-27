import type { ComponentMetadata } from "../../component-core/metadata/types";
import { templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { IncludeMarkupMd } from "./IncludeMarkup";
import { IncludeMarkupComponent } from "./IncludeMarkupReact";

export const includeMarkupRenderer = wrapComponent({
  name: "IncludeMarkup",
  metadata: IncludeMarkupMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <IncludeMarkupComponent
      url={adapter.resourceUrl(adapter.prop("url"))}
      loadingContent={
        templateChildren(adapter.node, "loadingContent")
          ? adapter.renderTemplate("loadingContent")
          : null
      }
      renderIncludedMarkup={(nodes) => adapter.context.renderChildren(nodes, adapter.scope)}
      onDidLoad={() => {
        void adapter.event("didLoad")();
      }}
      onDidFail={(message) => {
        void adapter.event("didFail")(message);
      }}
    />
  ),
});
