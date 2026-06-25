import { DocumentCursor } from "../language-server/base/text-document";
import { TransformDiag } from "../parsers/xmlui-parser/diagnostics";
import { createXmlUiParser } from "../parsers/xmlui-parser/parser";
import { nodeToComponentDef } from "../parsers/xmlui-parser/transform";
import type {
  XmluiAgentResponseEnvelope,
  XmluiValidationIssue,
  XmluiValidationResult,
} from "./AgentContractDefs";

export function isXmluiAgentResponseEnvelope(value: unknown): value is XmluiAgentResponseEnvelope {
  return parseXmluiAgentResponseEnvelope(value).ok;
}

export function parseXmluiAgentResponseEnvelope(
  input: unknown,
): { ok: true; envelope: XmluiAgentResponseEnvelope } | { ok: false; issues: XmluiValidationIssue[] } {
  const parsed = typeof input === "string" ? parseJsonEnvelope(input) : input;

  if (!isRecord(parsed)) {
    return invalidEnvelope("xmlui-envelope-type", "Expected a JSON object or JSON string.");
  }

  const kind = parsed.kind;
  if (kind === "code") {
    return parseCodeEnvelope(parsed);
  }

  if (kind === "clarification") {
    return parseClarificationEnvelope(parsed);
  }

  if (kind === "error") {
    return parseErrorEnvelope(parsed);
  }

  return invalidEnvelope(
    "xmlui-envelope-kind",
    'Envelope must declare kind "code", "clarification", or "error".',
  );
}

export function validateGeneratedXmluiSource(source: string, fileId: string | number = 0): XmluiValidationResult {
  if (!source.trim()) {
    return {
      ok: false,
      issues: [makeIssue("xmlui-empty-source", "Generated XMLUI source is empty.")],
    };
  }

  const parser = createXmlUiParser(source);
  const parseResult = parser.parse();
  if (parseResult.errors.length > 0) {
    return {
      ok: false,
      issues: parseResult.errors.map((diag) => ({
        code: diag.code,
        message: diag.message,
        severity: "error",
        pos: diag.pos,
      })),
    };
  }

  const warnings: string[] = [];
  const cursor = new DocumentCursor(source);

  try {
    const component = nodeToComponentDef(parseResult.node, parser.getText, fileId, undefined, warnings, cursor);
    if (!component) {
      return {
        ok: false,
        issues: [
          makeIssue(
            "xmlui-no-root-component",
            "Generated XMLUI source did not produce a component.",
          ),
        ],
        warnings,
      };
    }

    return { ok: true, component, warnings };
  } catch (error) {
    if (error instanceof TransformDiag) {
      return {
        ok: false,
        issues: [transformDiagToIssue(error)],
        warnings,
      };
    }

    throw error;
  }
}

function parseCodeEnvelope(
  parsed: Record<string, unknown>,
): { ok: true; envelope: XmluiAgentResponseEnvelope } | { ok: false; issues: XmluiValidationIssue[] } {
  const issues: XmluiValidationIssue[] = [];
  const operation = readString(parsed.operation, "operation", issues);
  const summary = readString(parsed.summary, "summary", issues);
  const code = readString(parsed.code, "code", issues);

  if (operation !== undefined && operation !== "create" && operation !== "modify") {
    issues.push(
      makeIssue(
        "xmlui-envelope-operation",
        'Envelope operation must be either "create" or "modify".',
      ),
    );
  }

  const metadata = readMetadata(parsed.metadata, issues);

  if (issues.length > 0 || operation === undefined || summary === undefined || code === undefined) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    envelope: {
      kind: "code",
      operation,
      summary,
      code,
      ...(metadata ? { metadata } : {}),
    },
  };
}

function parseClarificationEnvelope(
  parsed: Record<string, unknown>,
): { ok: true; envelope: XmluiAgentResponseEnvelope } | { ok: false; issues: XmluiValidationIssue[] } {
  const issues: XmluiValidationIssue[] = [];
  const question = readString(parsed.question, "question", issues);
  const choices = readStringArray(parsed.choices, "choices", issues);
  const reason = readOptionalString(parsed.reason, "reason", issues);

  if (issues.length > 0 || question === undefined) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    envelope: {
      kind: "clarification",
      question,
      ...(choices ? { choices } : {}),
      ...(reason !== undefined ? { reason } : {}),
    },
  };
}

function parseErrorEnvelope(
  parsed: Record<string, unknown>,
): { ok: true; envelope: XmluiAgentResponseEnvelope } | { ok: false; issues: XmluiValidationIssue[] } {
  const issues: XmluiValidationIssue[] = [];
  const message = readString(parsed.message, "message", issues);
  const code = readOptionalString(parsed.code, "code", issues);

  if (issues.length > 0 || message === undefined) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    envelope: {
      kind: "error",
      message,
      ...(code !== undefined ? { code } : {}),
    },
  };
}

function readMetadata(
  value: unknown,
  issues: XmluiValidationIssue[],
): NonNullable<Extract<XmluiAgentResponseEnvelope, { kind: "code" }>["metadata"]> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    issues.push(makeIssue("xmlui-envelope-metadata", "Metadata must be a JSON object."));
    return undefined;
  }

  const metadata: NonNullable<Extract<XmluiAgentResponseEnvelope, { kind: "code" }>["metadata"]> = {};
  const title = readOptionalString(value.title, "metadata.title", issues);
  const componentsUsed = readStringArray(value.componentsUsed, "metadata.componentsUsed", issues);
  const dataSourcesUsed = readStringArray(value.dataSourcesUsed, "metadata.dataSourcesUsed", issues);
  const assumptions = readStringArray(value.assumptions, "metadata.assumptions", issues);

  if (title !== undefined) metadata.title = title;
  if (componentsUsed) metadata.componentsUsed = componentsUsed;
  if (dataSourcesUsed) metadata.dataSourcesUsed = dataSourcesUsed;
  if (assumptions) metadata.assumptions = assumptions;

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

function readString(
  value: unknown,
  path: string,
  issues: XmluiValidationIssue[],
): string | undefined {
  if (typeof value !== "string") {
    issues.push(makeIssue("xmlui-envelope-field", `${path} must be a string.`));
    return undefined;
  }
  return value;
}

function readOptionalString(
  value: unknown,
  path: string,
  issues: XmluiValidationIssue[],
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return readString(value, path, issues);
}

function readStringArray(
  value: unknown,
  path: string,
  issues: XmluiValidationIssue[],
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    issues.push(makeIssue("xmlui-envelope-field", `${path} must be an array of strings.`));
    return undefined;
  }

  const values = value.map((entry, index) => {
    if (typeof entry !== "string") {
      issues.push(
        makeIssue(
          "xmlui-envelope-field",
          `${path}[${index}] must be a string.`,
        ),
      );
      return undefined;
    }
    return entry;
  });

  const cleaned = values.filter((entry): entry is string => entry !== undefined);
  return cleaned.length > 0 ? cleaned : [];
}

function parseJsonEnvelope(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}

function transformDiagToIssue(diag: TransformDiag): XmluiValidationIssue {
  return {
    code: diag.code,
    message: diag.message,
    severity: "error",
    pos: diag.pos,
    end: diag.end,
  };
}

function makeIssue(code: string, message: string, severity: "error" | "warn" = "error"): XmluiValidationIssue {
  return { code, message, severity };
}

function invalidEnvelope(
  code: string,
  message: string,
): { ok: false; issues: XmluiValidationIssue[] } {
  return { ok: false, issues: [makeIssue(code, message)] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
