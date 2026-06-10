import { afterEach, describe, expect, it, vi } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { check, type CheckOptions } from "../../src/nodejs/bin/check";

class ProcessExitError extends Error {
  constructor(public readonly code?: string | number | null) {
    super(`process.exit(${code})`);
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

async function runCheck(
  markup: string,
  options: Partial<Omit<CheckOptions, "dir">> = {},
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "xmlui-check-"));
  fs.writeFileSync(path.join(root, "Main.xmlui"), markup, "utf-8");

  const stdout: string[] = [];
  const stderr: string[] = [];
  let exitCode: string | number | null | undefined;

  vi.spyOn(process.stdout, "write").mockImplementation((chunk: any) => {
    stdout.push(String(chunk));
    return true;
  });
  vi.spyOn(process.stderr, "write").mockImplementation((chunk: any) => {
    stderr.push(String(chunk));
    return true;
  });
  vi.spyOn(process, "exit").mockImplementation(((code?: string | number | null) => {
    exitCode = code;
    throw new ProcessExitError(code);
  }) as typeof process.exit);

  try {
    await check({
      dir: root,
      format: "json",
      strict: false,
      includeRules: [],
      excludeRules: [],
      a11y: false,
      ...options,
    });
  } catch (err) {
    if (!(err instanceof ProcessExitError)) {
      throw err;
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }

  return {
    stdout: stdout.join(""),
    stderr: stderr.join(""),
    exitCode,
  };
}

describe("xmlui check", () => {
  it("emits language-server type-contract diagnostics in JSON format", async () => {
    const result = await runCheck(`<Stack unknownProp="1" />`);

    expect(result.exitCode).toBeUndefined();
    expect(result.stderr).toBe("");

    const diagnostics = JSON.parse(result.stdout);
    expect(diagnostics).toEqual([
      expect.objectContaining({
        file: "Main.xmlui",
        line: 1,
        column: 8,
        severity: "warn",
        code: "id-unknown-prop",
        source: "xmlui-type-contract",
      }),
    ]);
  });

  it("filters accessibility diagnostics by default", async () => {
    const result = await runCheck(`<App><Button icon="trash" /></App>`);

    expect(result.exitCode).toBeUndefined();
    expect(JSON.parse(result.stdout)).toEqual([]);
  });

  it("includes accessibility diagnostics when requested", async () => {
    const result = await runCheck(`<App><Button icon="trash" /></App>`, {
      a11y: true,
    });

    expect(result.exitCode).toBeUndefined();

    const diagnostics = JSON.parse(result.stdout);
    expect(diagnostics).toEqual([
      expect.objectContaining({
        file: "Main.xmlui",
        severity: "warn",
        code: "icon-only-button-no-label",
        source: "xmlui-a11y",
      }),
    ]);
  });

  it("treats warnings as errors in strict mode", async () => {
    const result = await runCheck(`<Stack unknownProp="1" />`, {
      format: "gnu",
      strict: true,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain(
      `Main.xmlui:1:8: error: <Stack> has unknown prop "unknownProp". [id-unknown-prop]`,
    );
  });
});
