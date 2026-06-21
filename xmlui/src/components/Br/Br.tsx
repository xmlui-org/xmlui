import React from "react";

import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";

export const BrMd = createBrMetadata("br");
export const BrCapitalizedMd = createBrMetadata("Br");

export const brRenderer = createBrRenderer("br", BrMd);
export const BrRenderer = createBrRenderer("Br", BrCapitalizedMd);

function createBrMetadata(name: string): ComponentMetadata {
  return createMetadata({
    status: "deprecated",
    description: "This component renders an HTML `br` tag for line breaks.",
    isHtmlTag: true,
    allowArbitraryProps: true,
    props: {
      testId: {
        description: "Adds a test identifier to the rendered line break.",
        valueType: "string",
      },
    },
  });
}

function createBrRenderer(name: string, metadata: ComponentMetadata) {
  return wrapComponent({
    name,
    metadata,
    renderer: ({ adapter }) => React.createElement("br", {
      ...nativeProps(adapter.props),
      ...adapter.rootAttrs(),
      className: adapter.className,
      style: adapter.style,
    }),
  });
}

function nativeProps(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).filter(([name, value]) =>
      value !== undefined &&
      value !== null &&
      name !== "testId" &&
      !name.startsWith("on"),
    ),
  );
}
