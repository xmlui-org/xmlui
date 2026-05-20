import { describe, expect, it, vi } from "vitest";
import {
  emitRuntimeTypeContractDiagnostics,
  resetRuntimeTypeContractDiagnostics,
} from "../../../src/components-core/type-contracts/runtime";
import type { ComponentMetadata } from "../../../src/abstractions/ComponentDefs";

const metadata: ComponentMetadata = {
  description: "Test",
  props: {
    count: { description: "Count", valueType: "number" },
    variant: {
      description: "Variant",
      valueType: "string",
      availableValues: ["solid", "ghost"],
    },
  },
  events: {},
};

function appContext(strict = false): any {
  return {
    appGlobals: { strictTypeContracts: strict },
    toast: { error: vi.fn() },
  };
}

describe("runtime type-contract diagnostics", () => {
  it("emits one diagnostic for an expression-valued wrong type", () => {
    resetRuntimeTypeContractDiagnostics();
    const ctx = appContext();
    const diags = emitRuntimeTypeContractDiagnostics(
      {
        uid: "n1",
        type: "NumberBox",
        props: { count: "{state.value}" },
      } as any,
      metadata,
      (() => "hello") as any,
      ctx,
      "n1",
    );
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({
      code: "wrong-type",
      severity: "warn",
      propName: "count",
      actual: "hello",
    });
  });

  it("dedupes by component, prop, code, and value", () => {
    resetRuntimeTypeContractDiagnostics();
    const ctx = appContext();
    const node = { uid: "n1", type: "Button", props: { variant: "{bad}" } } as any;
    const extractValue = (() => "vibrant") as any;
    expect(emitRuntimeTypeContractDiagnostics(node, metadata, extractValue, ctx, "n1")).toHaveLength(1);
    expect(emitRuntimeTypeContractDiagnostics(node, metadata, extractValue, ctx, "n1")).toHaveLength(0);
  });

  it("strict mode escalates and fires a toast", () => {
    resetRuntimeTypeContractDiagnostics();
    const ctx = appContext(true);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const diags = emitRuntimeTypeContractDiagnostics(
      { uid: "n1", type: "Button", props: { variant: "{bad}" } } as any,
      metadata,
      (() => "vibrant") as any,
      ctx,
      "n1",
    );
    expect(diags[0].severity).toBe("error");
    expect(ctx.toast.error).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });
});
