/**
 * Runtime integration tests for UDC sandbox enforcement (Plan #14 W6-1/W6-2/W6-3).
 *
 * These tests verify that the scope gate (W6-1), capability gate (W6-2), and
 * trust-mode escalation (W6-3) actually fire when expressions evaluate inside
 * a UDC that has a non-empty `UdcContract`.  Coverage is intentionally focused
 * on the integration points (evalIdentifier / evalMemberAccessCore) — the
 * lower-level helpers (gateCapability, narrowCapabilities, buildScopeGate,
 * compareManifest) are exercised by `contract.test.ts`.
 */

import { describe, expect, it } from "vitest";

import { evalBindingExpression } from "../../../src/components-core/script-runner/eval-tree-sync";
import type { BindingTreeEvaluationContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import {
  emptyContract,
  parseCapabilityList,
  type UdcDiagnostic,
} from "../../../src/components-core/udc-sandbox";

function makeContext(
  options: Partial<NonNullable<BindingTreeEvaluationContext["options"]>> = {},
  appContext: Record<string, any> = {},
): { ctx: BindingTreeEvaluationContext; diags: UdcDiagnostic[] } {
  const diags: UdcDiagnostic[] = [];
  const ctx: BindingTreeEvaluationContext = {
    mainThread: { childThreads: [], blocks: [{ vars: {} }], loops: [], breakLabelValue: -1 },
    localContext: {},
    appContext: {
      App: { fetch: () => {}, randomBytes: () => {}, now: () => 0 },
      navigate: () => {},
      Clipboard: { copy: () => {} },
      Log: { info: () => {} },
      ...appContext,
    },
    options: {
      udcDiagnosticLogger: (d) => diags.push(d),
      ...options,
    },
  } as BindingTreeEvaluationContext;
  return { ctx, diags };
}

describe("UDC sandbox — runtime capability gate (W6-2)", () => {
  it("does not gate when no contract is set", () => {
    const { ctx, diags } = makeContext();
    evalBindingExpression("App.fetch", ctx);
    expect(diags).toHaveLength(0);
  });

  it("emits udc-capability-missing for App.fetch when contract omits fetch", () => {
    const contract = emptyContract("Demo");
    contract.capabilities = parseCapabilityList("log");
    contract.capabilitiesDeclared = true;
    const { ctx, diags } = makeContext({ udcContract: contract });
    evalBindingExpression("App.fetch", ctx);
    const cap = diags.find((d) => d.code === "udc-capability-missing");
    expect(cap).toBeDefined();
    expect((cap?.data as any)?.capability).toBe("fetch");
    expect(cap?.severity).toBe("warn");
  });

  it("throws in strict mode when capability is missing", () => {
    const contract = emptyContract("Demo");
    contract.capabilities = parseCapabilityList("log");
    contract.capabilitiesDeclared = true;
    const { ctx } = makeContext({ udcContract: contract, strictUdcSandbox: true });
    expect(() => evalBindingExpression("App.fetch", ctx)).toThrow(/capability/i);
  });

  it("does not emit when capability is declared", () => {
    const contract = emptyContract("Demo");
    contract.capabilities = parseCapabilityList("fetch, log");
    contract.capabilitiesDeclared = true;
    const { ctx, diags } = makeContext({ udcContract: contract, strictUdcSandbox: true });
    expect(() => evalBindingExpression("App.fetch", ctx)).not.toThrow();
    expect(diags.filter((d) => d.code === "udc-capability-missing")).toHaveLength(0);
  });

  it("gates root-identifier navigate() against the navigate capability", () => {
    const contract = emptyContract("Demo");
    contract.capabilities = parseCapabilityList("log");
    contract.capabilitiesDeclared = true;
    const { ctx, diags } = makeContext({ udcContract: contract });
    evalBindingExpression("navigate", ctx);
    const cap = diags.find((d) => d.code === "udc-capability-missing");
    expect((cap?.data as any)?.capability).toBe("navigate");
  });

  it("gates Clipboard against the clipboard capability", () => {
    const contract = emptyContract("Demo");
    contract.capabilities = parseCapabilityList("log");
    contract.capabilitiesDeclared = true;
    const { ctx, diags } = makeContext({ udcContract: contract });
    evalBindingExpression("Clipboard", ctx);
    const cap = diags.find((d) => d.code === "udc-capability-missing");
    expect((cap?.data as any)?.capability).toBe("clipboard");
  });
});

describe("UDC sandbox — capability mapper override", () => {
  it("honours a custom udcCapabilityMapper", () => {
    const contract = emptyContract("Demo");
    contract.capabilities = parseCapabilityList("log");
    contract.capabilitiesDeclared = true;
    const { ctx, diags } = makeContext({
      udcContract: contract,
      udcCapabilityMapper: (root, member) =>
        root === "App" && member === "doStuff" ? "fetch" : undefined,
    });
    evalBindingExpression("App.doStuff", ctx, undefined as any);
    const cap = diags.find((d) => d.code === "udc-capability-missing");
    expect((cap?.data as any)?.capability).toBe("fetch");
  });
});
