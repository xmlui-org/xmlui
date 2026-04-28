import type { CSSProperties } from "react";
import { memo, useMemo } from "react";
import classnames from "classnames";
import styles from "./ReadingTime.module.scss";

export const defaultProps = {
  wordsPerMinute: 265,
  label: "min read",
};

type Props = {
  content?: string;
  wordsPerMinute?: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

export function computeReadingMinutes(
  content: string | undefined | null,
  wordsPerMinute: number,
): number {
  if (!content || typeof content !== "string") return 0;
  const stripped = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  const words = stripped.trim().split(/\s+/).filter((w) => w.length > 0).length;
  if (words === 0) return 0;
  const wpm = wordsPerMinute > 0 ? wordsPerMinute : defaultProps.wordsPerMinute;
  return Math.max(1, Math.ceil(words / wpm));
}

export const ReadingTime = memo(function ReadingTime({
  content,
  wordsPerMinute = defaultProps.wordsPerMinute,
  label = defaultProps.label,
  className,
  style,
}: Props) {
  const minutes = useMemo(
    () => computeReadingMinutes(content, wordsPerMinute),
    [content, wordsPerMinute],
  );
  if (minutes <= 0) return null;
  return (
    <span
      className={classnames("xmlui-reading-time", styles.root, className)}
      style={style}
      aria-label={`${minutes} ${label}`}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>
        {minutes} {label}
      </span>
    </span>
  );
});
