import { createMetadata, parseScssVar, wrapComponent, type ComponentMetadata } from "xmlui";
import { ReadingTime, defaultProps } from "./ReadingTimeNative";
import styles from "./ReadingTime.module.scss";

const COMP = "ReadingTime";

export const ReadingTimeMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    `\`${COMP}\` displays the estimated reading time for a piece of text or markdown ` +
    `content as "{N} min read" with a clock icon. The duration is computed by counting ` +
    `words and dividing by \`wordsPerMinute\`.`,
  props: {
    content: {
      description: "Text or markdown content used to estimate reading time.",
      valueType: "string",
    },
    wordsPerMinute: {
      description: "Average reading speed in words per minute.",
      valueType: "number",
      defaultValue: defaultProps.wordsPerMinute,
    },
    label: {
      description: 'Suffix displayed after the duration. Defaults to "min read".',
      valueType: "string",
      defaultValue: defaultProps.label,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`gap-${COMP}`]: "0.375rem",
    [`color-${COMP}`]: "$textColor-secondary",
    [`fontSize-${COMP}`]: "$fontSize-small",
    [`size-icon-${COMP}`]: "1em",
  },
});

export const readingTimeRenderer = wrapComponent(COMP, ReadingTime, ReadingTimeMd, {
  numbers: ["wordsPerMinute"],
});
