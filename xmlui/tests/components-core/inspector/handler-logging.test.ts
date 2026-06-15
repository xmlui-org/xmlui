import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHandlerLogger } from "../../../src/components-core/inspector/handler-logging";

describe("handler logging", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let originalXsLogs: any;
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    originalWindow = (globalThis as any).window;
    originalDocument = (globalThis as any).document;
    if (!(globalThis as any).window) {
      (globalThis as any).window = {};
    }
    if (!(globalThis as any).document) {
      (globalThis as any).document = {};
    }
    originalXsLogs = (globalThis as any).window._xsLogs;
    (globalThis as any).window._xsLogs = undefined;
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    if (originalWindow) {
      (globalThis as any).window._xsLogs = originalXsLogs;
    } else {
      delete (globalThis as any).window;
    }
    if (originalDocument) {
      (globalThis as any).document = originalDocument;
    } else {
      delete (globalThis as any).document;
    }
  });

  it("prints contextual handler errors even when inspector verbosity is off", () => {
    const logger = createHandlerLogger({
      appContext: { xmluiConfig: { xsVerbose: false } } as any,
    });

    logger.logHandlerError({
      uid: "uid-1",
      eventName: "onClick",
      componentType: "Button",
      componentLabel: "Save",
      error: new Error("Evaluation of = requires a left-hand value."),
      handlerCode: "missingTarget.value = event.payload.id",
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toContain("[XMLUI handler error] Button Save.onClick failed.");
    expect(consoleErrorSpy.mock.calls[0][0]).toContain("The assignment target may not exist");
    expect(consoleErrorSpy.mock.calls[0][0]).toContain("missingTarget.value");
    expect(consoleErrorSpy.mock.calls[0][1]).toMatchObject({
      diagnosticCode: "handler-assignment-target",
    });
    expect((globalThis as any).window._xsLogs).toBeUndefined();
  });

  it("records handler error details in the Inspector trace when verbosity is on", () => {
    (globalThis as any).window._xsLogs = [];
    const logger = createHandlerLogger({
      appContext: { xmluiConfig: { xsVerbose: true } } as any,
    });

    logger.logHandlerError({
      uid: "uid-1",
      eventName: "onClick",
      componentType: "Button",
      componentLabel: "Save",
      error: new Error("Evaluation of = requires a left-hand value."),
      handlerCode: "missingTarget.value = event.payload.id",
      traceId: "trace-1",
    });

    const entry = (globalThis as any).window._xsLogs.find(
      (entry: any) => entry.kind === "handler:error",
    );
    expect(entry).toBeDefined();
    expect(entry.kind).toBe("handler:error");
    expect(entry.eventName).toBe("onClick");
    expect(entry.componentType).toBe("Button");
    expect(entry.componentLabel).toBe("Save");
    expect(entry.handlerCode).toBe("missingTarget.value = event.payload.id");
    expect(entry.diagnosticCode).toBe("handler-assignment-target");
    expect(entry.diagnosticHint).toContain("Declare it with var.*");
    expect(entry.error.message).toBe("Evaluation of = requires a left-hand value.");
  });
});
