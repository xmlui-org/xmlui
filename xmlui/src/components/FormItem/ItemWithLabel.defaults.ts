// Leaf module: holds the runtime defaults for `ItemWithLabel` separately from the
// React component itself. This file MUST NOT import any `.tsx` React components or
// `.module.scss` styles. It is pulled into the metadata-only graph
// (see `metadata-helpers.ts`), and dragging React/SCSS in here causes
// `vite-plugin-lib-inject-css` to emit a stray per-module CSS chunk that
// inverts the `@layer` cascade in production builds.
//
// See `xmlui/dev-docs/plans/css-layer-order-rootcause.md` for context.

import type { LabelPosition, RequireLabelMode } from "../abstractions";

export type ItemWithLabelDefaults = {
  labelBreak: boolean;
  enabled: boolean;
  labelPosition: LabelPosition;
  required: boolean;
  validationInProgress: boolean;
  shrinkToLabel: boolean;
  cloneStyle: boolean;
  requireLabelMode: RequireLabelMode;
  isInputTemplateUsed: boolean;
  direction: "rtl" | "ltr";
  compactInlineLabel: boolean;
};

export const defaultProps: ItemWithLabelDefaults = {
  labelBreak: true,
  enabled: true,
  labelPosition: "top",
  required: false,
  validationInProgress: false,
  shrinkToLabel: false,
  cloneStyle: false,
  requireLabelMode: "markRequired",
  isInputTemplateUsed: false,
  direction: "ltr",
  compactInlineLabel: false,
};
