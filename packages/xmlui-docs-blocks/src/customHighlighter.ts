export type SyntaxThemeTone = "light" | "dark";

export type CustomSyntaxToken = {
  start: number;
  end: number;
  type: string;
};

export type CustomSyntaxTokenStyle = {
  color?: string;
  backgroundColor?: string;
  fontStyle?: "normal" | "italic";
  fontWeight?: string | number;
  textDecoration?: string;
};

export type CustomSyntaxDecoration = {
  start: number;
  end: number;
  properties?: {
    class?: string;
    style?: string;
  };
};

export type CustomSyntaxLanguage = {
  id: string;
  aliases?: string[];
  tokenize: (code: string) => CustomSyntaxToken[];
  semanticHighlight?: (context: {
    code: string;
    tokens: CustomSyntaxToken[];
  }) => CustomSyntaxToken[];
  theme: Record<SyntaxThemeTone, Record<string, CustomSyntaxTokenStyle>>;
  backgroundColor?: Partial<Record<SyntaxThemeTone, string>>;
};

type HighlightOptions = {
  lang: string;
  themeTone?: string;
  decorations?: CustomSyntaxDecoration[];
};

const supportedThemeTones: SyntaxThemeTone[] = ["light", "dark"];

export function createCustomLanguageRegistry(languages: CustomSyntaxLanguage[]) {
  const languageByName = new Map<string, CustomSyntaxLanguage>();

  languages.forEach((language) => {
    languageByName.set(language.id, language);
    language.aliases?.forEach((alias) => languageByName.set(alias, language));
  });

  return {
    availableLangs: Array.from(languageByName.keys()),
    canHighlight(lang: string) {
      return languageByName.has(lang);
    },
    highlight(code: string, options: HighlightOptions) {
      const language = languageByName.get(options.lang);
      if (!language) return null;
      return renderCustomLanguage(code, language, options);
    },
  };
}

function renderCustomLanguage(
  code: string,
  language: CustomSyntaxLanguage,
  { lang, themeTone = "light", decorations = [] }: HighlightOptions,
) {
  const tone = supportedThemeTones.includes(themeTone as SyntaxThemeTone)
    ? (themeTone as SyntaxThemeTone)
    : "light";
  const lexicalTokens = normalizeTokens(code, language.tokenize(code));
  const semanticTokens = normalizeTokens(
    code,
    language.semanticHighlight?.({ code, tokens: lexicalTokens }) ?? [],
  );
  const tokens = [...lexicalTokens, ...semanticTokens];
  const className = `shiki xmlui-${tone} language-${escapeAttribute(lang)}`;
  const background = language.backgroundColor?.[tone] ?? "transparent";

  return `<pre class="${className}" style="background-color:${escapeAttribute(background)}"><code>${renderLines(
    code,
    tokens,
    normalizeDecorations(code, decorations),
    language.theme[tone],
  )}</code></pre>`;
}

function renderLines(
  code: string,
  tokens: CustomSyntaxToken[],
  decorations: CustomSyntaxDecoration[],
  theme: Record<string, CustomSyntaxTokenStyle>,
) {
  const lineRanges = getLineRanges(code);

  return lineRanges
    .map(({ start, end }) => {
      const lineDecorations = decorations.filter(
        (decoration) => decoration.start <= start && decoration.end >= end,
      );
      const lineClass = ["line", ...getDecorationClasses(lineDecorations)].join(" ");
      return `<span class="${lineClass}">${renderLineSegments(
        code,
        start,
        end,
        tokens,
        decorations,
        theme,
      )}</span>`;
    })
    .join("\n");
}

function renderLineSegments(
  code: string,
  lineStart: number,
  lineEnd: number,
  tokens: CustomSyntaxToken[],
  decorations: CustomSyntaxDecoration[],
  theme: Record<string, CustomSyntaxTokenStyle>,
) {
  const boundaries = new Set([lineStart, lineEnd]);
  const relevantTokens = tokens.filter(
    (token) => token.start < lineEnd && token.end > lineStart,
  );
  const relevantDecorations = decorations.filter(
    (decoration) => decoration.start < lineEnd && decoration.end > lineStart,
  );

  [...relevantTokens, ...relevantDecorations].forEach(({ start, end }) => {
    boundaries.add(clamp(start, lineStart, lineEnd));
    boundaries.add(clamp(end, lineStart, lineEnd));
  });

  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);
  return sortedBoundaries
    .slice(0, -1)
    .map((start, index) => {
      const end = sortedBoundaries[index + 1];
      const text = code.slice(start, end);
      if (!text) return "";

      const token = findLast(relevantTokens, (token) => token.start <= start && token.end >= end);
      const activeDecorations = relevantDecorations.filter(
        (decoration) => decoration.start <= start && decoration.end >= end,
      );
      const tokenStyle = token ? theme[token.type] : undefined;
      const style = [
        styleToCss(tokenStyle),
        ...activeDecorations.map((decoration) => decoration.properties?.style),
      ]
        .filter(Boolean)
        .join(" ");
      const classes = getDecorationClasses(activeDecorations);

      if (!style && classes.length === 0) {
        return escapeHtml(text);
      }

      const classAttr = classes.length > 0 ? ` class="${classes.join(" ")}"` : "";
      const styleAttr = style ? ` style="${escapeAttribute(style)}"` : "";
      return `<span${classAttr}${styleAttr}>${escapeHtml(text)}</span>`;
    })
    .join("");
}

function normalizeTokens(code: string, tokens: CustomSyntaxToken[]) {
  return tokens
    .filter((token) => token.end > token.start)
    .map((token) => ({
      ...token,
      start: clamp(token.start, 0, code.length),
      end: clamp(token.end, 0, code.length),
    }))
    .filter((token) => token.end > token.start);
}

function normalizeDecorations(code: string, decorations: CustomSyntaxDecoration[]) {
  return decorations
    .filter((decoration) => decoration.end > decoration.start)
    .map((decoration) => ({
      ...decoration,
      start: clamp(decoration.start, 0, code.length),
      end: clamp(decoration.end, 0, code.length),
    }));
}

function getLineRanges(code: string) {
  const ranges: Array<{ start: number; end: number }> = [];
  let lineStart = 0;

  code.split("\n").forEach((line) => {
    const lineEnd = lineStart + line.length;
    ranges.push({ start: lineStart, end: lineEnd });
    lineStart = lineEnd + 1;
  });

  return ranges;
}

function styleToCss(style?: CustomSyntaxTokenStyle) {
  if (!style) return "";

  return Object.entries(style)
    .map(([key, value]) => {
      if (value === undefined) return "";
      return `${camelToKebabCase(key)}:${value}`;
    })
    .filter(Boolean)
    .join(";");
}

function getDecorationClasses(decorations: CustomSyntaxDecoration[]) {
  return decorations
    .map((decoration) => decoration.properties?.class)
    .filter((className): className is string => !!className);
}

function findLast<T>(items: T[], predicate: (item: T) => boolean) {
  for (let i = items.length - 1; i >= 0; i--) {
    if (predicate(items[i])) return items[i];
  }
  return undefined;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function camelToKebabCase(value: string) {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
