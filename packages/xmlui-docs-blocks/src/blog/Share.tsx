import { createMetadata, parseScssVar, wrapComponent, type ComponentMetadata } from "xmlui";
import { Share, defaultProps } from "./ShareNative";
import styles from "./Share.module.scss";

const COMP = "Share";

export const ShareMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    `\`${COMP}\` renders a "Copy & share" dropdown that lets users copy the page ` +
    `as markdown for LLMs, open the page in ChatGPT or Claude with a pre-filled ` +
    `prompt, or share it on X (Twitter) or LinkedIn. Designed for blog posts and ` +
    `documentation pages.`,
  props: {
    label: {
      description: "Label of the dropdown trigger button.",
      valueType: "string",
      defaultValue: defaultProps.label,
    },
    pageUrl: {
      description:
        "URL to share. Defaults to `window.location.href` when not provided.",
      valueType: "string",
    },
    pageTitle: {
      description:
        "Title used as the share text on social platforms. Defaults to `document.title`.",
      valueType: "string",
    },
    markdownContent: {
      description: "Markdown content placed on the clipboard by the Copy page action.",
      valueType: "string",
    },
    copyLabel: {
      description: "Label of the Copy page menu item.",
      valueType: "string",
      defaultValue: defaultProps.copyLabel,
    },
    copyDescription: {
      description: "Secondary text under the Copy page label.",
      valueType: "string",
      defaultValue: defaultProps.copyDescription,
    },
    copiedLabel: {
      description: "Label shown briefly after copying succeeds.",
      valueType: "string",
      defaultValue: defaultProps.copiedLabel,
    },
    chatGptLabel: {
      description: "Label of the Open in ChatGPT menu item.",
      valueType: "string",
      defaultValue: defaultProps.chatGptLabel,
    },
    chatGptDescription: {
      description: "Secondary text under the Open in ChatGPT label.",
      valueType: "string",
      defaultValue: defaultProps.chatGptDescription,
    },
    claudeLabel: {
      description: "Label of the Open in Claude menu item.",
      valueType: "string",
      defaultValue: defaultProps.claudeLabel,
    },
    claudeDescription: {
      description: "Secondary text under the Open in Claude label.",
      valueType: "string",
      defaultValue: defaultProps.claudeDescription,
    },
    twitterLabel: {
      description: "Label of the Share in X menu item.",
      valueType: "string",
      defaultValue: defaultProps.twitterLabel,
    },
    twitterDescription: {
      description: "Secondary text under the Share in X label.",
      valueType: "string",
      defaultValue: defaultProps.twitterDescription,
    },
    linkedInLabel: {
      description: "Label of the Share in LinkedIn menu item.",
      valueType: "string",
      defaultValue: defaultProps.linkedInLabel,
    },
    linkedInDescription: {
      description: "Secondary text under the Share in LinkedIn label.",
      valueType: "string",
      defaultValue: defaultProps.linkedInDescription,
    },
    showCopy: {
      description: "Whether to show the Copy page menu item.",
      valueType: "boolean",
      defaultValue: defaultProps.showCopy,
    },
    showChatGpt: {
      description: "Whether to show the Open in ChatGPT menu item.",
      valueType: "boolean",
      defaultValue: defaultProps.showChatGpt,
    },
    showClaude: {
      description: "Whether to show the Open in Claude menu item.",
      valueType: "boolean",
      defaultValue: defaultProps.showClaude,
    },
    showTwitter: {
      description: "Whether to show the Share in X (Twitter) menu item.",
      valueType: "boolean",
      defaultValue: defaultProps.showTwitter,
    },
    showLinkedIn: {
      description: "Whether to show the Share in LinkedIn menu item.",
      valueType: "boolean",
      defaultValue: defaultProps.showLinkedIn,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor-Card",
    [`backgroundColor-${COMP}--hover`]: "$color-surface-100",
    [`borderColor-${COMP}`]: "$borderColor",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`color-${COMP}`]: "$textColor-primary",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`fontSize-${COMP}`]: "$fontSize-small",
    [`paddingHorizontal-${COMP}-trigger`]: "$space-3",
    [`paddingVertical-${COMP}-trigger`]: "$space-2",
    [`backgroundColor-${COMP}Menu`]: "$color-surface-raised",
    [`backgroundColor-${COMP}Item--hover`]: "$color-surface-100",
    [`borderColor-${COMP}Menu`]: "$borderColor",
    [`boxShadow-${COMP}Menu`]: "$boxShadow-xl",
    [`color-${COMP}Item-secondary`]: "$textColor-secondary",
    [`fontSize-${COMP}Item-secondary`]: "$fontSize-small",
    [`gap-${COMP}Menu`]: "$space-1",
    [`minWidth-${COMP}Menu`]: "300px",
    [`paddingHorizontal-${COMP}Menu`]: "$space-2",
    [`paddingVertical-${COMP}Menu`]: "$space-2",
    [`paddingHorizontal-${COMP}Item`]: "$space-3",
    [`paddingVertical-${COMP}Item`]: "$space-2",
  },
});

export const shareRenderer = wrapComponent(COMP, Share, ShareMd, {
  booleans: ["showCopy", "showChatGpt", "showClaude", "showTwitter", "showLinkedIn"],
});
