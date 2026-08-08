import type { NormalizedColumnType } from "../Column/column-types";
import type { LocaleProfile } from "../../components-core/i18n";

export type TableCellRenderModel =
  | {
      kind: "empty";
      text: "";
    }
  | {
      kind:
        | "text"
        | "short-text"
        | "long-text"
        | "markdown"
        | "code"
        | "json"
        | "boolean"
        | "checkbox"
        | "yes-no"
        | "date"
        | "tag"
        | "tags"
        | "id"
        | "uuid"
        | "name"
        | "address"
        | "duration"
        | "rating"
        | "status"
        | "enum"
        | "list";
      text: string;
    }
  | {
      kind: "color";
      text: string;
      color: string;
    }
  | {
      kind: "image" | "avatar";
      text: string;
      src: string;
      alt: string;
    }
  | {
      kind: "icon";
      text: string;
      iconName: string;
    }
  | {
      kind: "number";
      text: string;
      integerPart: string;
      decimalSeparator?: string;
      fractionPart?: string;
      suffixPart?: string;
    }
  | {
      kind: "link";
      text: string;
      href: string;
    };

export type FormatTableCellOptions = {
  locale?: string;
  localeProfile?: LocaleProfile;
  now?: Date;
};

export function formatTableCellValue(
  value: unknown,
  columnType: NormalizedColumnType,
  options: FormatTableCellOptions = {},
): TableCellRenderModel {
  const columnLocale = stringOption(columnType, "locale");
  const localeProfile = columnLocale ? undefined : options.localeProfile;
  const locale = columnLocale ?? localeProfile?.locale ?? options.locale;
  if (value === null || value === undefined) {
    return columnType.name === "json"
      ? { kind: "json", text: "null" }
      : { kind: "empty", text: "" };
  }

  switch (columnType.name) {
    case "text":
    case "short-text":
    case "long-text":
    case "markdown":
    case "code":
    case "uuid":
    case "name":
    case "address":
      return { kind: columnType.name, text: String(value) };

    case "id":
      return { kind: "id", text: formatIdCell(value, columnType) };

    case "number":
    case "integer":
    case "decimal":
    case "percent":
    case "currency":
    case "accounting":
    case "scientific":
      return formatNumericCell(value, columnType, locale, localeProfile);

    case "rating":
      return formatRatingCell(value, columnType, locale, localeProfile);

    case "boolean":
      return { kind: "boolean", text: value ? "true" : "false" };

    case "checkbox":
      return { kind: "checkbox", text: value ? "✓" : "" };

    case "yes-no":
      return { kind: "yes-no", text: value ? "Yes" : "No" };

    case "date":
    case "time":
    case "datetime":
    case "timestamp":
    case "iso-date":
      return formatDateCell(value, columnType, locale);

    case "relative-time":
      return formatRelativeTimeCell(value, locale, options.now ?? new Date());

    case "email": {
      const text = String(value);
      return { kind: "link", text, href: `mailto:${text}` };
    }

    case "phone": {
      const text = String(value);
      return { kind: "link", text, href: `tel:${text}` };
    }

    case "url":
    case "link": {
      const href = String(value);
      return { kind: "link", text: labelForUrl(href, columnType), href };
    }

    case "enum":
    case "status":
      return { kind: columnType.name, text: mappedLabel(value, columnType) };

    case "json":
    case "object":
    case "array":
      return { kind: "json", text: safeJson(value) };

    case "tag":
      return { kind: "tag", text: String(value) };

    case "tags":
      return {
        kind: "tags",
        text: Array.isArray(value) ? value.map(String).join(", ") : String(value),
      };

    case "list":
      return {
        kind: "list",
        text: Array.isArray(value) ? value.map(String).join(", ") : String(value),
      };

    case "bytes":
      return formatBytesCell(value, locale, localeProfile);

    case "duration":
      return { kind: "duration", text: formatDurationCell(value) };

    case "color": {
      const text = String(value);
      return { kind: "color", text, color: text };
    }

    case "image":
    case "avatar": {
      const src = String(value);
      return {
        kind: columnType.name,
        text: src,
        src,
        alt: stringOption(columnType, "alt") ?? stringOption(columnType, "label") ?? src,
      };
    }

    case "icon": {
      const iconName = String(value);
      return { kind: "icon", text: iconName, iconName };
    }

    default:
      return { kind: "text", text: String(value) };
  }
}

function formatIdCell(value: unknown, columnType: NormalizedColumnType): string {
  const text = String(value);
  if (columnType.options?.mode === "full" || text.length <= 12) {
    return text;
  }
  return `${text.slice(0, 8)}...`;
}

function formatRatingCell(
  value: unknown,
  columnType: NormalizedColumnType,
  locale: string | undefined,
  localeProfile: LocaleProfile | undefined,
): TableCellRenderModel {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return { kind: "text", text: String(value) };
  }
  const max = numberOption(columnType, "max") ?? 5;
  return {
    kind: "rating",
    text: `${formatNumberText(numericValue, locale, {}, localeProfile)} / ${max}`,
  };
}

function formatNumericCell(
  value: unknown,
  columnType: NormalizedColumnType,
  locale: string | undefined,
  localeProfile: LocaleProfile | undefined,
): TableCellRenderModel {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return { kind: "text", text: String(value) };
  }

  const intlOptions: Intl.NumberFormatOptions = {};
  if (columnType.name === "integer") {
    intlOptions.maximumFractionDigits = 0;
  }
  if (columnType.name === "decimal") {
    const scale = numberOption(columnType, "scale");
    if (scale !== undefined) {
      intlOptions.minimumFractionDigits = scale;
      intlOptions.maximumFractionDigits = scale;
    }
  }
  if (columnType.name === "number") {
    const scale = numberOption(columnType, "scale");
    if (scale !== undefined) {
      intlOptions.maximumFractionDigits = scale;
    }
  }
  if (columnType.name === "percent") {
    intlOptions.style = "percent";
  }
  if (columnType.name === "currency" || columnType.name === "accounting") {
    intlOptions.style = "currency";
    intlOptions.currency = stringOption(columnType, "currency") ?? localeProfile?.currency ?? "USD";
    if (columnType.name === "accounting") {
      intlOptions.currencySign = "accounting";
    }
  }
  if (columnType.name === "scientific") {
    intlOptions.notation = "scientific";
  }

  const formatter = new Intl.NumberFormat(locale, withNumberingSystem(intlOptions, localeProfile));
  const parts = formatNumberParts(formatter, numericValue, localeProfile);
  return {
    kind: "number",
    text: joinNumberParts(parts),
    ...splitNumberParts(parts),
  };
}

function formatDateCell(
  value: unknown,
  columnType: NormalizedColumnType,
  locale: string | undefined,
): TableCellRenderModel {
  const date = toDate(value);
  if (!date) {
    return { kind: "text", text: String(value) };
  }
  if (columnType.name === "iso-date") {
    return { kind: "date", text: date.toISOString().slice(0, 10) };
  }
  if (columnType.name === "timestamp") {
    return { kind: "date", text: String(date.getTime()) };
  }

  const style = stringOption(columnType, "style") as Intl.DateTimeFormatOptions["dateStyle"];
  const intlOptions: Intl.DateTimeFormatOptions =
    columnType.name === "time"
      ? { timeStyle: style || "short" }
      : columnType.name === "datetime"
        ? { dateStyle: style || "short", timeStyle: style || "short" }
        : { dateStyle: style || "medium" };

  return { kind: "date", text: new Intl.DateTimeFormat(locale, intlOptions).format(date) };
}

function formatRelativeTimeCell(
  value: unknown,
  locale: string | undefined,
  now: Date,
): TableCellRenderModel {
  const date = toDate(value);
  if (!date) {
    return { kind: "text", text: String(value) };
  }
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const divisions: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  const [unit, secondsPerUnit] =
    divisions.find(([, seconds]) => absSeconds >= seconds) ?? divisions[divisions.length - 1];
  return {
    kind: "date",
    text: new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      Math.round(diffSeconds / secondsPerUnit),
      unit,
    ),
  };
}

function formatBytesCell(
  value: unknown,
  locale: string | undefined,
  localeProfile: LocaleProfile | undefined,
): TableCellRenderModel {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return { kind: "text", text: String(value) };
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let scaled = numericValue;
  while (Math.abs(scaled) >= 1024 && unitIndex < units.length - 1) {
    scaled /= 1024;
    unitIndex++;
  }
  const parts = formatNumberParts(
    new Intl.NumberFormat(locale, withNumberingSystem({ maximumFractionDigits: 1 }, localeProfile)),
    scaled,
    localeProfile,
  );
  const integerPart = joinNumberParts(parts);
  return {
    kind: "number",
    text: `${integerPart} ${units[unitIndex]}`,
    integerPart,
    suffixPart: ` ${units[unitIndex]}`,
  };
}

function formatDurationCell(value: unknown): string {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }
  const totalSeconds = Math.max(0, Math.round(numericValue));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [
    hours ? `${hours}h` : "",
    minutes ? `${minutes}m` : "",
    seconds || (!hours && !minutes) ? `${seconds}s` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

function formatNumberText(
  value: number,
  locale: string | undefined,
  options: Intl.NumberFormatOptions,
  localeProfile: LocaleProfile | undefined,
): string {
  return joinNumberParts(
    formatNumberParts(
      new Intl.NumberFormat(locale, withNumberingSystem(options, localeProfile)),
      value,
      localeProfile,
    ),
  );
}

function formatNumberParts(
  formatter: Intl.NumberFormat,
  value: number,
  localeProfile: LocaleProfile | undefined,
): Intl.NumberFormatPart[] {
  return formatter.formatToParts(value).map((part) => replaceNumberPart(part, localeProfile));
}

function joinNumberParts(parts: Intl.NumberFormatPart[]): string {
  return parts.map((part) => part.value).join("");
}

function splitNumberParts(parts: Intl.NumberFormatPart[]) {
  const decimalIndex = parts.findIndex((part) => part.type === "decimal");
  if (decimalIndex < 0) {
    return { integerPart: parts.map((part) => part.value).join("") };
  }

  const suffixPart = parts
    .slice(parts.findIndex((part) => part.type === "fraction") + 1)
    .map((part) => part.value)
    .join("");

  return {
    integerPart: parts
      .slice(0, decimalIndex)
      .map((part) => part.value)
      .join(""),
    decimalSeparator: parts[decimalIndex].value,
    fractionPart: parts
      .filter((part) => part.type === "fraction")
      .map((part) => part.value)
      .join(""),
    ...(suffixPart ? { suffixPart } : {}),
  };
}

function replaceNumberPart(
  part: Intl.NumberFormatPart,
  localeProfile: LocaleProfile | undefined,
): Intl.NumberFormatPart {
  if (!localeProfile) return part;
  switch (part.type) {
    case "decimal":
      return localeProfile.decimalSeparator === undefined
        ? part
        : { ...part, value: localeProfile.decimalSeparator };
    case "group":
      return localeProfile.groupSeparator === undefined
        ? part
        : { ...part, value: localeProfile.groupSeparator };
    case "minusSign":
      return localeProfile.minusSign === undefined
        ? part
        : { ...part, value: localeProfile.minusSign };
    default:
      return part;
  }
}

function withNumberingSystem(
  options: Intl.NumberFormatOptions,
  localeProfile: LocaleProfile | undefined,
): Intl.NumberFormatOptions {
  if (!localeProfile?.numberingSystem || options.numberingSystem) {
    return options;
  }
  return {
    ...options,
    numberingSystem: localeProfile.numberingSystem,
  };
}

function numberOption(columnType: NormalizedColumnType, key: string): number | undefined {
  const value = columnType.options?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringOption(columnType: NormalizedColumnType, key: string): string | undefined {
  const value = columnType.options?.[key];
  return typeof value === "string" ? value : undefined;
}

function toDate(value: unknown): Date | undefined {
  const date = value instanceof Date ? value : new Date(value as any);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function mappedLabel(value: unknown, columnType: NormalizedColumnType): string {
  const options = columnType.options ?? {};
  const valueMap = options.values ?? options.map ?? options;
  if (valueMap && typeof valueMap === "object" && !Array.isArray(valueMap)) {
    const mapped = (valueMap as Record<string, any>)[String(value)];
    if (typeof mapped === "string") {
      return mapped;
    }
    if (mapped && typeof mapped === "object" && typeof mapped.label === "string") {
      return mapped.label;
    }
  }
  return String(value);
}

function labelForUrl(value: string, columnType: NormalizedColumnType): string {
  if (columnType.options?.label === "domain") {
    try {
      return new URL(value).hostname;
    } catch {
      return value;
    }
  }
  return typeof columnType.options?.label === "string" ? columnType.options.label : value;
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
