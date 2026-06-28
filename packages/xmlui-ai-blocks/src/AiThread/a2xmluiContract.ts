export type A2XmluiRequestDirectives = {
  allowFullReplacement?: boolean;
};

export type A2XmluiRequestBody = {
  messages: unknown[];
  currentCode?: string;
  runtimeContext?: Record<string, unknown>;
  requestDirectives?: A2XmluiRequestDirectives;
  selectedAgent?: string;
  selectedModel?: string;
};

export type A2XmluiAgentResponse =
  | {
      version?: string;
      kind: "code";
      operation: "create" | "modify";
      summary: string;
      code: string;
      metadata?: {
        title?: string;
        notes?: string[];
        changedFiles?: string[];
      };
    }
  | {
      version?: string;
      kind: "clarification";
      question: string;
      choices?: string[];
      reason?: string;
    };

export type A2XmluiParseIssue = {
  code: string;
  message: string;
};

export type A2XmluiParseResult =
  | {
      ok: true;
      response: A2XmluiAgentResponse;
      source: A2XmluiParseSource;
    }
  | {
      ok: false;
      issues: A2XmluiParseIssue[];
      rawText?: string;
    };

type ParseOptions = {
  currentCode?: string;
};

type FenceMatch = {
  language: string;
  content: string;
};

type A2XmluiParseSource = "json" | "fence-json" | "fence-xmlui";

export function parseA2XmluiResponse(input: unknown, options: ParseOptions = {}): A2XmluiParseResult {
  if (isRecord(input)) {
    return parseEnvelopeObject(input, "json");
  }

  if (typeof input !== "string") {
    return invalidParse("a2xmlui-response-type", "Expected a JSON object or string response.", String(input));
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return invalidParse("a2xmlui-response-empty", "The response body was empty.", input);
  }

  const fence = extractFence(trimmed);
  if (fence) {
    if (fence.language === "xmlui") {
      return {
        ok: true,
        source: "fence-xmlui",
        response: {
          kind: "code",
          operation: options.currentCode ? "modify" : "create",
          summary: "Generated XMLUI code",
          code: fence.content,
        },
      };
    }

    const parsed = tryParseJson(fence.content);
    if (parsed && isRecord(parsed)) {
      return parseEnvelopeObject(parsed, "fence-json");
    }

    return invalidParse(
      "a2xmlui-fence-json",
      "A fenced response was found, but its JSON payload could not be parsed.",
      input,
    );
  }

  const parsed = tryParseJson(trimmed);
  if (parsed && isRecord(parsed)) {
    return parseEnvelopeObject(parsed, "json");
  }

  return invalidParse(
    "a2xmlui-response-format",
    "Expected a JSON envelope or a fenced XMLUI/JSON response.",
    input,
  );
}

function parseEnvelopeObject(
  parsed: Record<string, unknown>,
  source: A2XmluiParseSource,
): A2XmluiParseResult {
  const kind = parsed.kind;

  if (kind === "code") {
    const issues: A2XmluiParseIssue[] = [];
    const operation = readString(parsed.operation, "operation", issues);
    const summary = readString(parsed.summary, "summary", issues);
    const code = readString(parsed.code, "code", issues);
    const version = readOptionalString(parsed.version, "version", issues);
    const metadata = readMetadata(parsed.metadata, issues);

    if (operation !== undefined && operation !== "create" && operation !== "modify") {
      issues.push(
        makeIssue("a2xmlui-response-operation", 'operation must be either "create" or "modify".'),
      );
    }

    if (issues.length > 0 || operation === undefined || summary === undefined || code === undefined) {
      return { ok: false, issues };
    }

    return {
      ok: true,
      source,
      response: {
        ...(version ? { version } : {}),
        kind: "code",
        operation,
        summary,
        code,
        ...(metadata ? { metadata } : {}),
      },
    };
  }

  if (kind === "clarification") {
    const issues: A2XmluiParseIssue[] = [];
    const question = readString(parsed.question, "question", issues);
    const version = readOptionalString(parsed.version, "version", issues);
    const choices = readStringArray(parsed.choices, "choices", issues);
    const reason = readOptionalString(parsed.reason, "reason", issues);

    if (issues.length > 0 || question === undefined) {
      return { ok: false, issues };
    }

    return {
      ok: true,
      source,
      response: {
        ...(version ? { version } : {}),
        kind: "clarification",
        question,
        ...(choices ? { choices } : {}),
        ...(reason !== undefined ? { reason } : {}),
      },
    };
  }

  return {
    ok: false,
    issues: [makeIssue("a2xmlui-response-kind", 'Envelope must declare kind "code" or "clarification".')],
  };
}

function readMetadata(
  value: unknown,
  issues: A2XmluiParseIssue[],
): NonNullable<Extract<A2XmluiAgentResponse, { kind: "code" }>["metadata"]> | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    issues.push(makeIssue("a2xmlui-response-metadata", "metadata must be a JSON object."));
    return undefined;
  }

  const metadata: NonNullable<Extract<A2XmluiAgentResponse, { kind: "code" }>["metadata"]> = {};
  const title = readOptionalString(value.title, "metadata.title", issues);
  const notes = readStringArray(value.notes, "metadata.notes", issues);
  const changedFiles = readStringArray(value.changedFiles, "metadata.changedFiles", issues);

  if (title !== undefined) metadata.title = title;
  if (notes) metadata.notes = notes;
  if (changedFiles) metadata.changedFiles = changedFiles;

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

function readString(value: unknown, path: string, issues: A2XmluiParseIssue[]): string | undefined {
  if (typeof value !== "string") {
    issues.push(makeIssue("a2xmlui-response-field", `${path} must be a string.`));
    return undefined;
  }
  return value;
}

function readOptionalString(value: unknown, path: string, issues: A2XmluiParseIssue[]): string | undefined {
  if (value === undefined) return undefined;
  return readString(value, path, issues);
}

function readStringArray(value: unknown, path: string, issues: A2XmluiParseIssue[]): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    issues.push(makeIssue("a2xmlui-response-field", `${path} must be an array of strings.`));
    return undefined;
  }

  const result = value.map((entry, index) => {
    if (typeof entry !== "string") {
      issues.push(makeIssue("a2xmlui-response-field", `${path}[${index}] must be a string.`));
      return undefined;
    }
    return entry;
  });

  const cleaned = result.filter((entry): entry is string => entry !== undefined);
  return cleaned.length > 0 ? cleaned : [];
}

function extractFence(input: string): FenceMatch | undefined {
  const match = input.match(/```([a-zA-Z0-9_-]*)[ \t]*\n([\s\S]*?)```/);
  if (!match) return undefined;
  return {
    language: (match[1] || "").trim().toLowerCase(),
    content: match[2].trim(),
  };
}

function tryParseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}

function invalidParse(code: string, message: string, rawText: string): A2XmluiParseResult {
  return { ok: false, issues: [makeIssue(code, message)], rawText };
}

function makeIssue(code: string, message: string): A2XmluiParseIssue {
  return { code, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
