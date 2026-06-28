import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../styling";
import { ProgressBarMd } from "./ProgressBar";
import { defaultProps } from "./ProgressBar.defaults";
import { ProgressBar } from "./ProgressBarReact";

export const progressBarRenderer = wrapComponent({
  name: "ProgressBar",
  metadata: ProgressBarMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const { className, ...attrs } = rootAttrs;
    return (
      <ProgressBar
        {...attrs}
        value={normalizeProgressValue(adapter.prop("value", defaultProps.value))}
        classes={{ [COMPONENT_PART_KEY]: typeof className === "string" ? className : "" }}
      />
    );
  },
});

function normalizeProgressValue(value: unknown): number {
  const numeric = typeof value === "number"
    ? value
    : typeof value === "string" && value.trim() !== ""
      ? Number(value)
      : value === true
        ? 1
        : value === false || value === null || value === undefined || value === ""
          ? 0
          : Number(value);
  if (!Number.isFinite(numeric)) {
    return defaultProps.value;
  }
  return Math.max(0, Math.min(1, numeric));
}
