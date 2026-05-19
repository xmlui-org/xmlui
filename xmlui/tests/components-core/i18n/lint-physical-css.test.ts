import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { lintFile, lintDirectory, PHYSICAL_CSS_RULES } from "../../../scripts/lint-physical-css";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTmpDir(): string {
  const dir = join(tmpdir(), `lint-css-test-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeScss(dir: string, name: string, content: string): string {
  const path = join(dir, name);
  writeFileSync(path, content, "utf8");
  return path;
}

// ---------------------------------------------------------------------------
// PHYSICAL_CSS_RULES sanity checks
// ---------------------------------------------------------------------------

describe("PHYSICAL_CSS_RULES", () => {
  it("contains entries for all expected physical properties", () => {
    const physicals = PHYSICAL_CSS_RULES.map((r) => r.physical);
    expect(physicals).toContain("margin-left");
    expect(physicals).toContain("margin-right");
    expect(physicals).toContain("padding-left");
    expect(physicals).toContain("padding-right");
    expect(physicals).toContain("text-align: left");
    expect(physicals).toContain("text-align: right");
    expect(physicals).toContain("left");
    expect(physicals).toContain("right");
  });
});

// ---------------------------------------------------------------------------
// lintFile — margin / padding violations
// ---------------------------------------------------------------------------

describe("lintFile — margin and padding properties", () => {
  let dir: string;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it("flags margin-left", () => {
    const p = writeScss(dir, "a.module.scss", `.foo {\n  margin-left: 8px;\n}`);
    const diags = lintFile(p);
    expect(diags).toHaveLength(1);
    expect(diags[0].physical).toBe("margin-left");
    expect(diags[0].logical).toBe("margin-inline-start");
    expect(diags[0].code).toBe("physical-css-property");
    expect(diags[0].severity).toBe("warn");
  });

  it("flags margin-right", () => {
    const p = writeScss(dir, "b.module.scss", `.foo {\n  margin-right: 8px;\n}`);
    expect(lintFile(p)).toHaveLength(1);
    expect(lintFile(p)[0].logical).toBe("margin-inline-end");
  });

  it("flags padding-left", () => {
    const p = writeScss(dir, "c.module.scss", `.foo {\n  padding-left: 4px;\n}`);
    expect(lintFile(p)).toHaveLength(1);
    expect(lintFile(p)[0].logical).toBe("padding-inline-start");
  });

  it("flags padding-right", () => {
    const p = writeScss(dir, "d.module.scss", `.foo {\n  padding-right: 4px;\n}`);
    expect(lintFile(p)).toHaveLength(1);
    expect(lintFile(p)[0].logical).toBe("padding-inline-end");
  });

  it("does NOT flag margin-inline-start", () => {
    const p = writeScss(dir, "e.module.scss", `.foo {\n  margin-inline-start: 8px;\n}`);
    expect(lintFile(p)).toHaveLength(0);
  });

  it("does NOT flag margin-inline-end", () => {
    const p = writeScss(dir, "f.module.scss", `.foo { margin-inline-end: 8px; }`);
    expect(lintFile(p)).toHaveLength(0);
  });

  it("does NOT flag padding-inline-start or padding-inline-end", () => {
    const p = writeScss(dir, "g.module.scss", `.foo { padding-inline-start: 4px; padding-inline-end: 4px; }`);
    expect(lintFile(p)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// lintFile — text-align violations
// ---------------------------------------------------------------------------

describe("lintFile — text-align", () => {
  let dir: string;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it("flags text-align: left", () => {
    const p = writeScss(dir, "a.module.scss", `.foo {\n  text-align: left;\n}`);
    const diags = lintFile(p);
    expect(diags).toHaveLength(1);
    expect(diags[0].logical).toBe("text-align: start");
  });

  it("flags text-align: right", () => {
    const p = writeScss(dir, "b.module.scss", `.foo {\n  text-align: right;\n}`);
    expect(lintFile(p)).toHaveLength(1);
    expect(lintFile(p)[0].logical).toBe("text-align: end");
  });

  it("does NOT flag text-align: start", () => {
    const p = writeScss(dir, "c.module.scss", `.foo { text-align: start; }`);
    expect(lintFile(p)).toHaveLength(0);
  });

  it("does NOT flag text-align: end", () => {
    const p = writeScss(dir, "d.module.scss", `.foo { text-align: end; }`);
    expect(lintFile(p)).toHaveLength(0);
  });

  it("does NOT flag text-align: center", () => {
    const p = writeScss(dir, "e.module.scss", `.foo { text-align: center; }`);
    expect(lintFile(p)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// lintFile — comment / suppression exemptions
// ---------------------------------------------------------------------------

describe("lintFile — comment and @rtl-intentional exemptions", () => {
  let dir: string;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it("does NOT flag a single-line comment", () => {
    const p = writeScss(dir, "a.module.scss", `// margin-left: 8px;`);
    expect(lintFile(p)).toHaveLength(0);
  });

  it("does NOT flag a CSS block comment line", () => {
    const p = writeScss(dir, "b.module.scss", `/* margin-left: 8px; */`);
    expect(lintFile(p)).toHaveLength(0);
  });

  it("does NOT flag a line annotated with @rtl-intentional", () => {
    const p = writeScss(dir, "c.module.scss", `  left: 0; // @rtl-intentional: drawer always anchors to physical left`);
    expect(lintFile(p)).toHaveLength(0);
  });

  it("DOES flag the same line when @rtl-intentional is absent", () => {
    const p = writeScss(dir, "d.module.scss", `  left: 0;`);
    expect(lintFile(p)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// lintFile — SCSS variable names not flagged
// ---------------------------------------------------------------------------

describe("lintFile — SCSS variable names not flagged", () => {
  let dir: string;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it("does NOT flag a SCSS variable assignment containing 'left'", () => {
    const p = writeScss(dir, "a.module.scss", `$paddingLeft-Foo: 8px;`);
    expect(lintFile(p)).toHaveLength(0);
  });

  it("does NOT flag a CSS variable usage with 'left' in name", () => {
    const p = writeScss(dir, "b.module.scss", `  padding: var(--xmlui-paddingLeft-Foo);`);
    expect(lintFile(p)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// lintFile — multiple violations in one file
// ---------------------------------------------------------------------------

describe("lintFile — multiple violations", () => {
  let dir: string;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it("reports all violations in one file", () => {
    const content = [
      `.foo {`,
      `  margin-left: 8px;`,
      `  padding-right: 4px;`,
      `  text-align: left;`,
      `}`,
    ].join("\n");
    const p = writeScss(dir, "multi.module.scss", content);
    expect(lintFile(p)).toHaveLength(3);
  });

  it("reports correct line numbers", () => {
    const content = [
      `.foo {`,
      `  margin-left: 8px;`,
      `  padding-right: 4px;`,
      `}`,
    ].join("\n");
    const p = writeScss(dir, "lines.module.scss", content);
    const diags = lintFile(p);
    expect(diags[0].line).toBe(2);
    expect(diags[1].line).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// lintFile — clean file returns empty array
// ---------------------------------------------------------------------------

describe("lintFile — clean file", () => {
  let dir: string;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it("returns empty array for a fully-logical file", () => {
    const content = [
      `.foo {`,
      `  margin-inline-start: 8px;`,
      `  margin-inline-end: 8px;`,
      `  padding-inline-start: 4px;`,
      `  padding-inline-end: 4px;`,
      `  text-align: start;`,
      `}`,
    ].join("\n");
    const p = writeScss(dir, "clean.module.scss", content);
    expect(lintFile(p)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// lintDirectory
// ---------------------------------------------------------------------------

describe("lintDirectory", () => {
  let dir: string;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it("scans all *.module.scss files recursively", () => {
    const sub = join(dir, "sub");
    mkdirSync(sub);
    writeScss(dir, "root.module.scss", `.a {\n  margin-left: 1px;\n}`);
    writeScss(sub, "nested.module.scss", `.b {\n  padding-right: 2px;\n}`);
    // non-module.scss should be ignored
    writeScss(dir, "other.scss", `.c {\n  margin-left: 3px;\n}`);

    const diags = lintDirectory(dir);
    expect(diags).toHaveLength(2);
  });
});
