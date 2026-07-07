export type ParseError = {
  type?: string;
  code?: string;
  message: string;
  row?: number;
};

export type ParseMeta = {
  fields?: string[];
  delimiter?: string;
  linebreak?: string;
  aborted?: boolean;
  truncated?: boolean;
  cursor?: number;
};

export type ParseResult<T = unknown> = {
  data: T[];
  errors: ParseError[];
  meta: ParseMeta;
};

export type ParseConfig = {
  delimiter?: string;
  header?: boolean;
  skipEmptyLines?: boolean | "greedy";
  dynamicTyping?: boolean;
  transform?: (value: string, field?: string) => unknown;
  complete?: (results: ParseResult<any>) => void;
  error?: (error: Error) => void;
};

function parseRows(input: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (input.startsWith(delimiter, i)) {
      row.push(cell);
      cell = "";
      i += delimiter.length - 1;
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function isEmptyRow(row: string[], greedy: boolean) {
  return row.every((cell) => (greedy ? cell.trim() === "" : cell === ""));
}

function applyValueTransforms(value: string, field: string | undefined, config: ParseConfig) {
  let nextValue: unknown = config.transform ? config.transform(value, field) : value;

  if (config.dynamicTyping && typeof nextValue === "string") {
    const trimmed = nextValue.trim();
    if (/^(true|false)$/i.test(trimmed)) {
      return trimmed.toLowerCase() === "true";
    }
    if (trimmed !== "" && Number.isFinite(Number(trimmed))) {
      return Number(trimmed);
    }
  }

  return nextValue;
}

export function parse(input: string, config: ParseConfig = {}): ParseResult<any> {
  try {
    const delimiter = config.delimiter || ",";
    const linebreak = input.includes("\r\n") ? "\r\n" : "\n";
    const skipEmptyLines = config.skipEmptyLines;
    const rows = parseRows(input, delimiter).filter((row) => {
      if (!skipEmptyLines) {
        return true;
      }
      return !isEmptyRow(row, skipEmptyLines === "greedy");
    });

    let fields: string[] | undefined;
    let data: any[];

    if (config.header) {
      fields = (rows.shift() || []).map(String);
      data = rows.map((row) =>
        Object.fromEntries(
          fields!.map((field, index) => [
            field,
            applyValueTransforms(row[index] ?? "", field, config),
          ]),
        ),
      );
    } else {
      data = rows.map((row) =>
        row.map((value, index) => applyValueTransforms(value, String(index), config)),
      );
    }

    const result: ParseResult<any> = {
      data,
      errors: [],
      meta: {
        fields,
        delimiter,
        linebreak,
        aborted: false,
        truncated: false,
        cursor: input.length,
      },
    };

    config.complete?.(result);
    return result;
  } catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause));
    const result: ParseResult<any> = {
      data: [],
      errors: [{ message: error.message }],
      meta: {},
    };
    config.error?.(error);
    config.complete?.(result);
    return result;
  }
}

const Papa = {
  parse,
};

export default Papa;
