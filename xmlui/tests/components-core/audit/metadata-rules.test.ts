/**
 * Unit tests for `buildBaselineRules` (W3-5 / Plan #15 Step 2.1).
 *
 * Verifies that `PropertyDef.audit` annotations on component props are
 * correctly converted into `RedactionRule[]` by the redactor, and that the
 * generated rules interact with `redact()` as expected.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { buildBaselineRules, redact } from "../../../src/components-core/audit/redactor";
import { defaultAuditPolicy } from "../../../src/components-core/audit/policy";
import type { ComponentPropertyMetadata } from "../../../src/abstractions/ComponentDefs";
import type { XsLogEntry } from "../../../src/components-core/inspector/inspectorUtils";
import { TextBoxMd, PasswordMd } from "../../../src/components/TextBox/TextBox";
import { APICallMd } from "../../../src/components/APICall/APICall";
import { FormMd } from "../../../src/components/Form/Form";

// ---------------------------------------------------------------------------
// buildBaselineRules
// ---------------------------------------------------------------------------

describe("buildBaselineRules — empty / public props", () => {
  it("returns an empty array when no props have audit metadata", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      label: { description: "A label" },
      enabled: { description: "Enabled flag", valueType: "boolean" },
    };
    expect(buildBaselineRules(props)).toEqual([]);
  });

  it("returns an empty array when all props are classified public", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      label: {
        description: "A label",
        audit: { classification: "public" },
      },
    };
    expect(buildBaselineRules(props)).toEqual([]);
  });
});

describe("buildBaselineRules — sensitive prop (hash default)", () => {
  it("emits a hash rule for a sensitive prop", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      email: {
        description: "User email",
        audit: { classification: "sensitive" },
      },
    };
    const rules = buildBaselineRules(props);
    expect(rules).toHaveLength(1);
    expect(rules[0]).toEqual({ selector: "email", mode: "hash" });
  });

  it("respects an explicit defaultRedaction override on a sensitive prop", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      name: {
        description: "Full name",
        audit: { classification: "sensitive", defaultRedaction: "mask" },
      },
    };
    const rules = buildBaselineRules(props);
    expect(rules).toHaveLength(1);
    expect(rules[0]).toEqual({ selector: "name", mode: "mask" });
  });
});

describe("buildBaselineRules — secret prop (mask default)", () => {
  it("emits a mask rule for a secret prop", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      password: {
        description: "Password input value",
        audit: { classification: "secret" },
      },
    };
    const rules = buildBaselineRules(props);
    expect(rules).toHaveLength(1);
    expect(rules[0]).toEqual({ selector: "password", mode: "mask" });
  });

  it("respects an explicit drop override on a secret prop", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      sessionToken: {
        description: "Session token",
        audit: { classification: "secret", defaultRedaction: "drop" },
      },
    };
    const rules = buildBaselineRules(props);
    expect(rules).toHaveLength(1);
    expect(rules[0]).toEqual({ selector: "sessionToken", mode: "drop" });
  });
});

describe("buildBaselineRules — fieldPolicies on object-typed prop", () => {
  it("emits per-key rules before the top-level rule", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      headers: {
        description: "Request headers",
        audit: {
          classification: "secret",
          defaultRedaction: "mask",
          fieldPolicies: {
            Authorization: { classification: "secret", defaultRedaction: "mask" },
            Cookie: { classification: "secret", defaultRedaction: "drop" },
          },
        },
      },
    };
    const rules = buildBaselineRules(props);
    // Two per-field rules + one top-level rule
    expect(rules).toHaveLength(3);

    const authRule = rules.find((r) => r.selector === "headers.Authorization");
    expect(authRule).toEqual({ selector: "headers.Authorization", mode: "mask" });

    const cookieRule = rules.find((r) => r.selector === "headers.Cookie");
    expect(cookieRule).toEqual({ selector: "headers.Cookie", mode: "drop" });

    const topRule = rules.find((r) => r.selector === "headers.*");
    expect(topRule).toEqual({ selector: "headers.*", mode: "mask" });
  });

  it("falls back to the top-level mode for unlisted header keys", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      headers: {
        description: "Request headers",
        audit: {
          classification: "secret",
          defaultRedaction: "mask",
          fieldPolicies: {
            Authorization: { classification: "secret", defaultRedaction: "mask" },
          },
        },
      },
    };
    const rules = buildBaselineRules(props);
    const policy = { ...defaultAuditPolicy(), redact: rules };

    // An entry that contains a headers object with an unlisted key (X-Api-Key)
    const entry: XsLogEntry = {
      ts: Date.now(),
      kind: "app:fetch",
      headers: { Authorization: "Bearer token123", "X-Api-Key": "key456" },
    } as unknown as XsLogEntry;

    const redacted = redact(entry, policy);
    const redactedEntry = redacted as any;
    // Authorization is masked
    expect(redactedEntry.headers.Authorization).toBe("[REDACTED]");
    // X-Api-Key is caught by the fallback `headers.*` wildcard rule (mask)
    expect(redactedEntry.headers["X-Api-Key"]).toBe("[REDACTED]");
  });
});

// ---------------------------------------------------------------------------
// Integration: buildBaselineRules + redact
// ---------------------------------------------------------------------------

describe("buildBaselineRules + redact integration", () => {
  it("masks secret fields derived from metadata", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      initialValue: {
        description: "Text input value",
        audit: { classification: "secret", defaultRedaction: "mask" },
      },
    };
    const rules = buildBaselineRules(props);
    const policy = { ...defaultAuditPolicy(), redact: rules };

    const entry: XsLogEntry = {
      ts: Date.now(),
      kind: "state:change",
      initialValue: "s3cr3t",
    } as unknown as XsLogEntry;

    const redacted = redact(entry, policy) as any;
    expect(redacted.initialValue).toBe("[REDACTED]");
  });

  it("hashes sensitive fields derived from metadata", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      email: {
        description: "User email",
        audit: { classification: "sensitive" },
      },
    };
    const rules = buildBaselineRules(props);
    const policy = { ...defaultAuditPolicy(), redact: rules };

    const entry: XsLogEntry = {
      ts: Date.now(),
      kind: "state:change",
      email: "user@example.com",
    } as unknown as XsLogEntry;

    const redacted = redact(entry, policy) as any;
    // Value is replaced with an 8-char hex hash (not the original email)
    expect(redacted.email).not.toBe("user@example.com");
    expect(typeof redacted.email).toBe("string");
    expect(/^[0-9a-f]{8}$/.test(redacted.email)).toBe(true);
  });

  it("drops secret fields whose policy specifies drop", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      headers: {
        description: "Request headers",
        audit: {
          classification: "secret",
          defaultRedaction: "mask",
          fieldPolicies: {
            Cookie: { classification: "secret", defaultRedaction: "drop" },
          },
        },
      },
    };
    const rules = buildBaselineRules(props);
    const policy = { ...defaultAuditPolicy(), redact: rules };

    const entry: XsLogEntry = {
      ts: Date.now(),
      kind: "app:fetch",
      headers: { Cookie: "session=abc", "Content-Type": "application/json" },
    } as unknown as XsLogEntry;

    const redacted = redact(entry, policy) as any;
    // Cookie is dropped (undefined after applying drop redaction)
    expect(redacted.headers.Cookie).toBeUndefined();
    // Content-Type is caught by the fallback `headers.*` wildcard rule (mask)
    expect(redacted.headers["Content-Type"]).toBe("[REDACTED]");
  });

  it("does not mutate the original entry", () => {
    const props: Record<string, ComponentPropertyMetadata> = {
      password: { description: "Password", audit: { classification: "secret" } },
    };
    const rules = buildBaselineRules(props);
    const policy = { ...defaultAuditPolicy(), redact: rules };

    const original: XsLogEntry = {
      ts: Date.now(),
      kind: "state:change",
      password: "original",
    } as unknown as XsLogEntry;

    redact(original, policy);
    expect((original as any).password).toBe("original");
  });
});

// ---------------------------------------------------------------------------
// TextBox initialValue audit annotation (spot-check against actual metadata)
// ---------------------------------------------------------------------------

describe("TextBox initialValue audit annotation", () => {
  it("TextBoxMd.props.initialValue is classified as sensitive with hash redaction", () => {
    const initialValueMeta = TextBoxMd.props?.initialValue;
    expect(initialValueMeta?.audit?.classification).toBe("sensitive");
    expect(initialValueMeta?.audit?.defaultRedaction).toBe("hash");
  });

  it("PasswordMd.props.initialValue is classified as secret with mask redaction", () => {
    const initialValueMeta = PasswordMd.props?.initialValue;
    expect(initialValueMeta?.audit?.classification).toBe("secret");
    expect(initialValueMeta?.audit?.defaultRedaction).toBe("mask");
  });
});

// ---------------------------------------------------------------------------
// APICall headers audit annotation (spot-check against actual metadata)
// ---------------------------------------------------------------------------

describe("APICall headers audit annotation", () => {
  it("headers prop is classified secret with fieldPolicies for Authorization and Cookie", () => {
    const headersMeta = APICallMd.props?.headers;
    expect(headersMeta?.audit?.classification).toBe("secret");
    expect(headersMeta?.audit?.defaultRedaction).toBe("mask");
    expect(headersMeta?.audit?.fieldPolicies?.Authorization?.defaultRedaction).toBe("mask");
    expect(headersMeta?.audit?.fieldPolicies?.Cookie?.defaultRedaction).toBe("drop");
  });
});

// ---------------------------------------------------------------------------
// Form data audit annotation (spot-check against actual metadata)
// ---------------------------------------------------------------------------

describe("Form data audit annotation", () => {
  it("data prop is classified as sensitive with hash redaction", () => {
    const dataMeta = FormMd.props?.data;
    expect(dataMeta?.audit?.classification).toBe("sensitive");
    expect(dataMeta?.audit?.defaultRedaction).toBe("hash");
  });
});
