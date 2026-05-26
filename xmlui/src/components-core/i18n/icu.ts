export class IcuFormatError extends Error {
  constructor(
    message: string,
    public readonly pattern: string,
  ) {
    super(message);
    this.name = "IcuFormatError";
  }
}

export type MessageVariables = Record<string, unknown>;

export function formatIcuMessage(
  pattern: string,
  vars: MessageVariables = {},
  locale = "en",
): string {
  try {
    return formatSegment(pattern, vars, locale);
  } catch (error) {
    if (error instanceof IcuFormatError) {
      throw error;
    }
    throw new IcuFormatError(error instanceof Error ? error.message : String(error), pattern);
  }
}

function formatSegment(segment: string, vars: MessageVariables, locale: string): string {
  let output = "";
  let index = 0;
  while (index < segment.length) {
    const open = segment.indexOf("{", index);
    if (open < 0) {
      output += segment.slice(index);
      break;
    }
    output += segment.slice(index, open);
    const close = findMatchingBrace(segment, open);
    if (close < 0) {
      throw new IcuFormatError("Unmatched ICU placeholder brace.", segment);
    }
    output += formatPlaceholder(segment.slice(open + 1, close).trim(), vars, locale);
    index = close + 1;
  }
  return output;
}

function formatPlaceholder(body: string, vars: MessageVariables, locale: string): string {
  const [name, type, rest] = splitTopLevel(body);
  if (!name) return "";
  if (!type) {
    return stringify(vars[name]);
  }
  switch (type.trim()) {
    case "plural":
      return formatPlural(name.trim(), rest ?? "", vars, locale);
    case "select":
      return formatSelect(name.trim(), rest ?? "", vars, locale);
    case "number":
      return new Intl.NumberFormat(locale, parseNumberStyle(rest)).format(Number(vars[name.trim()] ?? 0));
    case "date":
      return formatDate(name.trim(), rest, vars, locale);
    case "time":
      return formatTime(name.trim(), rest, vars, locale);
    default:
      return stringify(vars[name.trim()]);
  }
}

function formatPlural(name: string, body: string, vars: MessageVariables, locale: string): string {
  const value = Number(vars[name] ?? 0);
  const options = parseOptions(body);
  const exact = options[`=${value}`];
  const category = new Intl.PluralRules(locale).select(value);
  const selected = exact ?? options[category] ?? options.other;
  if (selected === undefined) {
    throw new IcuFormatError("ICU plural requires an other branch.", body);
  }
  return formatSegment(selected.replace(/#/g, new Intl.NumberFormat(locale).format(value)), vars, locale);
}

function formatSelect(name: string, body: string, vars: MessageVariables, locale: string): string {
  const options = parseOptions(body);
  const selected = options[String(vars[name])] ?? options.other;
  if (selected === undefined) {
    throw new IcuFormatError("ICU select requires an other branch.", body);
  }
  return formatSegment(selected, vars, locale);
}

function parseOptions(body: string): Record<string, string> {
  const options: Record<string, string> = {};
  let index = 0;
  while (index < body.length) {
    while (/\s/.test(body[index] ?? "")) index++;
    const keyStart = index;
    while (index < body.length && !/\s|\{/.test(body[index])) index++;
    const key = body.slice(keyStart, index);
    while (/\s/.test(body[index] ?? "")) index++;
    if (!key || body[index] !== "{") break;
    const close = findMatchingBrace(body, index);
    if (close < 0) {
      throw new IcuFormatError("Unmatched ICU option brace.", body);
    }
    options[key] = body.slice(index + 1, close);
    index = close + 1;
  }
  return options;
}

function splitTopLevel(body: string): [string, string?, string?] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < body.length; index++) {
    const ch = body[index];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (ch === "," && depth === 0) {
      parts.push(body.slice(start, index).trim());
      start = index + 1;
      if (parts.length === 2) break;
    }
  }
  parts.push(body.slice(start).trim());
  return [parts[0], parts[1], parts.slice(2).join(",").trim() || undefined];
}

function findMatchingBrace(text: string, open: number): number {
  let depth = 0;
  for (let index = open; index < text.length; index++) {
    if (text[index] === "{") depth++;
    if (text[index] === "}") {
      depth--;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function parseNumberStyle(style?: string): Intl.NumberFormatOptions | undefined {
  switch (style?.trim()) {
    case "integer":
      return { maximumFractionDigits: 0 };
    case "percent":
      return { style: "percent" };
    default:
      return undefined;
  }
}

function formatDate(
  name: string,
  style: string | undefined,
  vars: MessageVariables,
  locale: string,
): string {
  const date = new Date(vars[name] as any);
  return new Intl.DateTimeFormat(locale, dateTimeStyle(style)).format(date);
}

function formatTime(
  name: string,
  style: string | undefined,
  vars: MessageVariables,
  locale: string,
): string {
  const date = new Date(vars[name] as any);
  return new Intl.DateTimeFormat(locale, timeStyle(style)).format(date);
}

function dateTimeStyle(style?: string): Intl.DateTimeFormatOptions {
  switch (style?.trim()) {
    case "short":
    case "medium":
    case "long":
    case "full":
      return { dateStyle: style.trim() as Intl.DateTimeFormatOptions["dateStyle"] };
    default:
      return {};
  }
}

function timeStyle(style?: string): Intl.DateTimeFormatOptions {
  switch (style?.trim()) {
    case "short":
    case "medium":
    case "long":
    case "full":
      return { timeStyle: style.trim() as Intl.DateTimeFormatOptions["timeStyle"] };
    default:
      return {};
  }
}

function stringify(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}
