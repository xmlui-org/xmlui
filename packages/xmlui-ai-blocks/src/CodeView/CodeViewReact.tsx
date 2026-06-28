import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTheme } from "xmlui";
import styles from "./CodeView.module.scss";

export type CodeViewProps = {
  code?: string;
};

function formatXmluiSource(source: string) {
  const compact = source
    .trim()
    .replace(/>\s+</g, "><")
    .replace(/></g, ">\n<");
  const lines = compact.split("\n");
  const formatted: string[] = [];
  let depth = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (line.startsWith("</")) {
      depth = Math.max(depth - 1, 0);
    }

    formatted.push(`${"  ".repeat(depth)}${line}`);

    const isOpeningTag = /^<[\w.-]+(?:\s|>|$)/.test(line);
    const isSelfClosing = /\/>$/.test(line);
    const hasClosingTag = /<\/[\w.-]+>$/.test(line) && !line.startsWith("</");

    if (isOpeningTag && !isSelfClosing && !hasClosingTag) {
      depth += 1;
    }
  }

  return formatted.join("\n");
}

function tokenizeXmluiLine(line: string) {
  const tokenPattern = /(<\/?[\w.-]+|\/?>|[\w:.-]+(?=\=)|"[^"]*"|'[^']*'|\{[^}]*\})/g;
  const tokens: Array<{ className: string; value: string }> = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(line))) {
    if (match.index > cursor) {
      tokens.push({ className: styles.text, value: line.slice(cursor, match.index) });
    }

    const value = match[0];
    let className = styles.text;
    if (value.startsWith("<")) {
      className = styles.tag;
    } else if (value === ">" || value === "/>") {
      className = styles.punctuation;
    } else if (value.startsWith("\"") || value.startsWith("'")) {
      className = styles.string;
    } else if (value.startsWith("{")) {
      className = styles.expression;
    } else {
      className = styles.attribute;
    }

    tokens.push({ className, value });
    cursor = match.index + value.length;
  }

  if (cursor < line.length) {
    tokens.push({ className: styles.text, value: line.slice(cursor) });
  }

  return tokens;
}

export function CodeView({ code = "" }: CodeViewProps) {
  const lines = useMemo(() => formatXmluiSource(code).split("\n"), [code]);
  const rootRef = useRef<HTMLDivElement>(null);
  // Follow the builder's active tone (light/dark) so the code view re-themes
  // alongside the rest of the app and the live preview.
  const { activeThemeTone } = useTheme();
  const handleWheel = useCallback((event: WheelEvent) => {
    const target = event.currentTarget as HTMLDivElement;
    const nextTop = target.scrollTop + event.deltaY;
    const nextLeft = target.scrollLeft + event.deltaX;
    const canScrollY = target.scrollHeight > target.clientHeight;
    const canScrollX = target.scrollWidth > target.clientWidth;

    if (!canScrollY && !canScrollX) {
      return;
    }

    target.scrollTop = nextTop;
    target.scrollLeft = nextLeft;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    root.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      root.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-tone={activeThemeTone}
      aria-label="Generated XMLUI code"
      role="region"
      tabIndex={0}
    >
      <pre className={styles.pre}>
        <code className={styles.code}>
          {lines.map((line, lineIndex) => (
            <span className={styles.line} key={`${lineIndex}-${line}`}>
              <span className={styles.lineNumber}>{lineIndex + 1}</span>
              <span className={styles.source}>
                {tokenizeXmluiLine(line).map((token, tokenIndex) => (
                  <span className={token.className} key={`${tokenIndex}-${token.value}`}>
                    {token.value}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
