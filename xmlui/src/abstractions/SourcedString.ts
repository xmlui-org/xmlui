export type SourcedStringSource = {
  fileId?: string | number;
  startLine: number;
  startColumn: number;
  startOffset: number;
};

export type SourcedString = {
  __xmluiSourcedString: true;
  value: string;
  source: SourcedStringSource;
};

export function createSourcedString(value: string, source: SourcedStringSource): SourcedString {
  return {
    __xmluiSourcedString: true,
    value,
    source,
  };
}

export function isSourcedString(value: unknown): value is SourcedString {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as SourcedString).__xmluiSourcedString === true
  );
}

export function getSourcedStringValue(value: unknown): string | undefined {
  if (isSourcedString(value)) {
    return value.value;
  }
  return typeof value === "string" ? value : undefined;
}

export function getSourcedStringSource(value: unknown): SourcedStringSource | undefined {
  return isSourcedString(value) ? value.source : undefined;
}

export function trimSourcedString(value: SourcedString): SourcedString {
  const original = value.value;
  const trimmed = original.trim();
  if (trimmed === original) {
    return value;
  }

  const leading = original.length - original.replace(/^\s+/, "").length;
  if (leading === 0) {
    return { ...value, value: trimmed };
  }

  let line = value.source.startLine;
  let column = value.source.startColumn;
  for (let i = 0; i < leading; i++) {
    if (original[i] === "\n") {
      line += 1;
      column = 0;
    } else {
      column += 1;
    }
  }

  return {
    __xmluiSourcedString: true,
    value: trimmed,
    source: {
      ...value.source,
      startLine: line,
      startColumn: column,
      startOffset: value.source.startOffset + leading,
    },
  };
}
