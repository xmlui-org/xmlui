import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";

const COMP = "br";
const BR = "Br";

export const BrMd = createBrMetadata();
export const BrCapitalizedMd = createBrMetadata();

export const brRenderer = createBrRenderer(COMP, BrMd);
export const BrRenderer = createBrRenderer(BR, BrCapitalizedMd);

function createBrMetadata(): ComponentMetadata {
  return createMetadata({
    status: "deprecated",
    description: "This component renders an HTML `br` tag for line breaks.",
    isHtmlTag: true,
    allowArbitraryProps: true,
  });
}

function createBrRenderer(name: string, metadata: ComponentMetadata) {
  return wrapComponent({
    name,
    metadata,
    renderer: ({ adapter }) => {
      const rootAttrs = adapter.rootAttrs();
      return (
        <br
          {...rootAttrs}
          className={adapter.className}
          style={adapter.style}
        />
      );
    },
  });
}
