import styles from "./XmluiBuilderFrame.module.scss";

import { createMetadata, dComponent } from "xmlui";
import { parseScssVar } from "xmlui";
import { wrapComponent } from "xmlui";

import { XmluiBuilderFrameNative, defaultProps } from "./XmluiBuilderFrameNative";

const COMP = "XmluiBuilderFrame";

export const XmluiBuilderFrameMd = createMetadata({
  status: "experimental",
  description:
    "An optional layout shell for AI-assisted XMLUI app generation. It arranges chat, preview, code, toolbar, status, and auxiliary regions without owning thread state or transport policy.",
  props: {
    layout: {
      description:
        "Controls the overall workspace layout. `auto` chooses a responsive split or tabs arrangement, `split` keeps chat and workspace side by side, `tabs` shows one panel at a time, and `stack` renders all supplied regions vertically.",
      valueType: "string",
      availableValues: ["auto", "split", "tabs", "stack"],
      isStrictEnum: true,
      defaultValue: defaultProps.layout,
    },
    chatPlacement: {
      description:
        "Places the chat column at the start or end of the split layout. `hidden` removes the chat column entirely.",
      valueType: "string",
      availableValues: ["start", "end", "hidden"],
      isStrictEnum: true,
      defaultValue: defaultProps.chatPlacement,
    },
    workspaceMode: {
      description:
        "Controls how the preview, code, and timeline regions are arranged inside the workspace area.",
      valueType: "string",
      availableValues: ["auto", "preview", "code", "split", "tabs"],
      isStrictEnum: true,
      defaultValue: defaultProps.workspaceMode,
    },
    activePanel: {
      description:
        "Selects the active panel when the frame is displaying tabs. The value can be `chat`, `preview`, `code`, or `timeline`.",
      valueType: "string",
      availableValues: ["chat", "preview", "code", "timeline"],
      isStrictEnum: true,
      defaultValue: defaultProps.activePanel,
    },
    resizable: {
      description:
        "When enabled, the split layout includes a draggable divider between chat and workspace. The frame still works when resizing is disabled.",
      valueType: "boolean",
      defaultValue: defaultProps.resizable,
    },
    compactBreakpoint: {
      description:
        "CSS length used to decide when the frame should collapse into a compact tabs layout.",
      valueType: "string",
      defaultValue: defaultProps.compactBreakpoint,
    },
    chatTemplate: dComponent("Template content for the chat transcript region."),
    composerTemplate: dComponent("Template content for the composer region."),
    toolbarTemplate: dComponent("Template content for the top toolbar region."),
    statusTemplate: dComponent("Template content for the status region."),
    previewTemplate: dComponent("Template content for the preview region."),
    codeTemplate: dComponent("Template content for the code region."),
    timelineTemplate: dComponent("Template content for the timeline region."),
    auxiliaryTemplate: dComponent("Template content for any extra auxiliary region."),
  },
  contextVars: {
    $activePanel: { description: "The currently selected panel." },
    $availablePanels: { description: "The visible panels available to the frame." },
    $chatPlacement: { description: "The resolved chat placement." },
    $compact: { description: "Whether the frame is in compact mode." },
    $layoutMode: { description: "The resolved outer layout mode." },
    $workspaceMode: { description: "The resolved workspace arrangement." },
    $resizable: { description: "Whether resizing is enabled." },
  },
  events: {
    panelChange: {
      description: "Fires when the active panel changes.",
      signature: "panelChange(panel: 'chat' | 'preview' | 'code' | 'timeline'): void",
      parameters: {
        panel: "The newly active panel.",
      },
    },
  },
  parts: {
    shell: { description: "The outer frame shell." },
    toolbar: { description: "The toolbar region." },
    status: { description: "The status region." },
    chat: { description: "The chat region." },
    workspace: { description: "The workspace region." },
    panel: { description: "A main content panel." },
    tabs: { description: "The tab strip." },
    tab: { description: "One tab button." },
    auxiliary: { description: "The auxiliary region." },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-XmluiBuilderFrame`]: "$color-surface-0",
    [`borderColor-XmluiBuilderFrame`]: "$borderColor",
    [`borderRadius-XmluiBuilderFrame`]: "$space-3",
    [`boxShadow-XmluiBuilderFrame`]: "$shadow-lg",
    [`backgroundColor-toolbar-XmluiBuilderFrame`]: "$color-surface-50",
    [`backgroundColor-status-XmluiBuilderFrame`]: "$color-surface-50",
    [`backgroundColor-panel-XmluiBuilderFrame`]: "$color-surface-0",
    [`backgroundColor-tabs-XmluiBuilderFrame`]: "$color-surface-50",
    [`backgroundColor-tab-XmluiBuilderFrame`]: "transparent",
    [`backgroundColor-tab-XmluiBuilderFrame--active`]: "$color-surface-0",
    [`borderColor-tab-XmluiBuilderFrame`]: "transparent",
    [`borderColor-tab-XmluiBuilderFrame--active`]: "$borderColor",
    [`minHeight-XmluiBuilderFrame`]: "32rem",
    [`gap-XmluiBuilderFrame`]: "$space-3",
    [`gap-panel-XmluiBuilderFrame`]: "$space-3",
    [`padding-XmluiBuilderFrame`]: "$space-4",
    [`padding-panel-XmluiBuilderFrame`]: "$space-4",
    [`padding-toolbar-XmluiBuilderFrame`]: "$space-3",
    [`padding-status-XmluiBuilderFrame`]: "$space-3",
    [`padding-tabs-XmluiBuilderFrame`]: "$space-2",
    [`padding-tab-XmluiBuilderFrame`]: "$space-2",
    dark: {
      [`backgroundColor-XmluiBuilderFrame`]: "$color-surface-100",
      [`backgroundColor-toolbar-XmluiBuilderFrame`]: "$color-surface-100",
      [`backgroundColor-status-XmluiBuilderFrame`]: "$color-surface-100",
      [`backgroundColor-panel-XmluiBuilderFrame`]: "$color-surface-100",
      [`backgroundColor-tabs-XmluiBuilderFrame`]: "$color-surface-100",
      [`backgroundColor-tab-XmluiBuilderFrame--active`]: "$color-surface-200",
    },
  },
});

export const xmluiBuilderFrameComponentRenderer = wrapComponent(
  COMP,
  XmluiBuilderFrameNative,
  XmluiBuilderFrameMd,
  {
    templates: {
      chatTemplate: "chatTemplate",
      composerTemplate: "composerTemplate",
      toolbarTemplate: "toolbarTemplate",
      statusTemplate: "statusTemplate",
      previewTemplate: "previewTemplate",
      codeTemplate: "codeTemplate",
      timelineTemplate: "timelineTemplate",
      auxiliaryTemplate: "auxiliaryTemplate",
    },
    events: {
      panelChange: "onPanelChange",
    },
  },
);
