import type { CSSProperties } from "react";

import styles from "./CodeText.module.scss";

export type CodeTextProps = {
  children?: string;
  className?: string;
  language?: string;
  style?: CSSProperties;
};

export function CodeText({ children = "", className, language, style }: CodeTextProps) {
  return (
    <pre className={[styles.codeText, className].filter(Boolean).join(" ")} style={style}>
      <code className={language ? `language-${language}` : undefined}>{children}</code>
    </pre>
  );
}
