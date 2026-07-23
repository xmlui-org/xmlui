import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import { extractEventHandlerDirectives } from "../../../src/components-core/utils/event-handler-directives";

function extract(source: string) {
  return extractEventHandlerDirectives(new Parser(source).parseStatements());
}

describe("event handler directive prologue", () => {
  it("extracts execution and scheduling directives from the handler prefix", () => {
    const result = extract('"sync"; "queue"; doWork();');

    expect(result.directives).toMatchObject({
      executionMode: "sync",
      scheduling: "queue",
      consumedCount: 2,
      warnings: [],
    });
    expect(result.executableStatements).toHaveLength(1);
  });

  it("maps async and block directives", () => {
    const result = extract('"async"; "block"; submit();');

    expect(result.directives).toMatchObject({
      executionMode: "async",
      scheduling: "block",
      consumedCount: 2,
      warnings: [],
    });
  });

  it("leaves unknown string literals executable and stops scanning", () => {
    const result = extract('"hello"; "sync"; doWork();');

    expect(result.directives).toMatchObject({
      consumedCount: 0,
      warnings: [],
    });
    expect(result.executableStatements).toHaveLength(3);
  });

  it("treats duplicate directives as idempotent", () => {
    const result = extract('"sync"; "sync"; doWork();');

    expect(result.directives).toMatchObject({
      executionMode: "sync",
      consumedCount: 2,
      warnings: [],
    });
  });

  it("warns for conflicting execution directives and lets the last one win", () => {
    const result = extract('"async"; "sync"; doWork();');

    expect(result.directives.executionMode).toBe("sync");
    expect(result.directives.warnings).toEqual([
      expect.objectContaining({ code: "handler-directive-conflict" }),
    ]);
  });

  it("warns for conflicting scheduling directives and lets the last one win", () => {
    const result = extract('"queue"; "block"; doWork();');

    expect(result.directives.scheduling).toBe("block");
    expect(result.directives.warnings).toEqual([
      expect.objectContaining({ code: "handler-directive-conflict" }),
    ]);
  });
});
