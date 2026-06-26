import { createMetadata } from "../../component-core/metadata/helpers";

const COMP = "Markdown";

export const defaultProps = {
  removeIndents: true,
  removeBr: false,
  showHeadingAnchors: false,
  openLinkInNewTab: false,
};

export const MarkdownMd = createMetadata({
  status: "stable",
  description: "`Markdown` renders Markdown text, XMLUI markdown bindings, and XMLUI playground fences.",
  props: {
    content: {
      description: "The Markdown source to render. Child text is used when omitted.",
      valueType: "string",
    },
    removeIndents: {
      description: "Removes the common indentation from Markdown child text before rendering.",
      valueType: "boolean",
      defaultValue: defaultProps.removeIndents,
    },
    removeBr: {
      description: "Removes HTML br tags from the rendered Markdown.",
      valueType: "boolean",
      defaultValue: defaultProps.removeBr,
    },
    showHeadingAnchors: {
      description: "Adds anchor links to Markdown headings.",
      valueType: "boolean",
      defaultValue: defaultProps.showHeadingAnchors,
    },
    anchorTemplate: {
      description: "Template for generated heading anchor ids.",
      valueType: "string",
    },
    openLinkInNewTab: {
      description: "Opens rendered Markdown links in a new browser tab.",
      valueType: "boolean",
      defaultValue: defaultProps.openLinkInNewTab,
    },
    testId: {
      description: "Adds a test identifier to the rendered Markdown container.",
      valueType: "string",
    },
  },
  themeVars: {
    [`textColor-${COMP}`]: "The Markdown text color.",
    [`fontFamily-${COMP}`]: "The Markdown font family.",
    [`fontSize-${COMP}`]: "The Markdown font size.",
    [`lineHeight-${COMP}`]: "The Markdown line height.",
    "padding-CodeText": "The padding around fenced code text.",
    "paddingLeft-CodeText-code": "The left padding of the code element inside a fenced block.",
    "textColor-Text-codefence": "The fenced code text color.",
    "fontFamily-Text-codefence": "The fenced code font family.",
  },
  defaultThemeVars: {
    [`textColor-${COMP}`]: "$textColor",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`fontSize-${COMP}`]: "$fontSize",
    [`lineHeight-${COMP}`]: "$lineHeight",
    [`padding-CodeText`]: "$space-3",
    [`paddingLeft-CodeText-code`]: "$space-2",
    [`textColor-Text-codefence`]: "$textColor",
    [`fontFamily-Text-codefence`]: "$fontFamily-monospace",
  },
});
