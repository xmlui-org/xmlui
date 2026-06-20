import React from "react";

import { createMetadata } from "../../component-core/metadata/helpers";
import { componentMetadataToContract } from "../../component-core/metadata/contract";
import { wrapComponent } from "../../runtime/rendering/adapter";

export const FragmentMd = createMetadata({
  status: "stable",
  description:
    "`Fragment` groups child components without rendering an extra DOM wrapper.",
  opaque: true,
  props: {},
});

export const fragmentContract = componentMetadataToContract(FragmentMd, {
  name: "Fragment",
  includeLayoutProps: false,
});

export const fragmentRenderer = wrapComponent({
  name: "Fragment",
  metadata: FragmentMd,
  renderer: ({ adapter }) => <React.Fragment>{adapter.renderChildren()}</React.Fragment>,
});
