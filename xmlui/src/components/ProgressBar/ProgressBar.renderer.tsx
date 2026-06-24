import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { ProgressBarMd } from "./ProgressBar";
import { defaultProps } from "./ProgressBar.defaults";
import { ProgressBar } from "./ProgressBarReact";

export const progressBarRenderer = wrapComponent({
  name: "ProgressBar",
  metadata: ProgressBarMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <ProgressBar
      {...adapter.rootAttrs()}
      value={adapter.prop("value", defaultProps.value)}
    />
  ),
});
