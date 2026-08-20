import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { MetadataProcessor } from "../../scripts/generate-docs/MetadataProcessor.mjs";

const tempRoots: string[] = [];

function makeFolders() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "xmlui-docs-generator-"));
  tempRoots.push(root);
  const sourceFolder = path.join(root, "source");
  const outFolder = path.join(root, "out");
  const examplesFolder = path.join(root, "examples");
  fs.mkdirSync(sourceFolder, { recursive: true });
  fs.mkdirSync(outFolder, { recursive: true });
  fs.mkdirSync(examplesFolder, { recursive: true });
  return { sourceFolder, outFolder, examplesFolder };
}

describe("MetadataProcessor", () => {
  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("deduplicates theme variables after stripping base component prefixes", () => {
    const folders = makeFolders();
    const processor = new MetadataProcessor(
      [
        {
          displayName: "FixtureSlider",
          status: "stable",
          description: "Synthetic component for docs generation.",
          descriptionRef: "",
          props: {},
          themeVars: {
            "Input:backgroundColor-thumb-FixtureSlider": {},
          },
          defaultThemeVars: {
            light: {
              "backgroundColor-thumb-FixtureSlider": "$color-primary-500",
            },
            dark: {
              "backgroundColor-thumb-FixtureSlider": "$color-primary-400",
            },
          },
        },
      ],
      "",
      folders,
    );

    processor.processDocfiles();

    const generated = fs.readFileSync(path.join(folders.outFolder, "FixtureSlider.md"), "utf8");
    const matchingRows = generated
      .split("\n")
      .filter((line) => line.includes("-thumb-FixtureSlider"));

    expect(matchingRows).toHaveLength(1);
    expect(matchingRows[0]).toBe(
      "| [backgroundColor-thumb-FixtureSlider](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-400 |",
    );
  });

  it("keeps limited theme variables when the component name is only in the stripped prefix", () => {
    const folders = makeFolders();
    const processor = new MetadataProcessor(
      [
        {
          displayName: "FixtureHeading",
          status: "stable",
          description: "Synthetic component for docs generation.",
          descriptionRef: "",
          props: {},
          themeVars: {
            "FixtureHeading:textColor-H1": {},
          },
          limitThemeVarsToComponent: true,
          defaultThemeVars: {
            light: {},
            dark: {},
          },
        },
      ],
      "",
      folders,
    );

    processor.processDocfiles();

    const generated = fs.readFileSync(path.join(folders.outFolder, "FixtureHeading.md"), "utf8");

    expect(generated).toContain(
      "| [textColor-H1](/docs/styles-and-themes/common-units/#color) | *none* | *none* |",
    );
  });

  it("keeps theme variable names contiguous when linking to reference docs", () => {
    const folders = makeFolders();
    const processor = new MetadataProcessor(
      [
        {
          displayName: "FixtureButton",
          status: "stable",
          description: "Synthetic component for docs generation.",
          descriptionRef: "",
          props: {},
          themeVars: {
            "fontSize-FixtureButton": {},
          },
          defaultThemeVars: {
            "fontSize-FixtureButton": "$fontSize-sm",
            light: {},
            dark: {},
          },
        },
      ],
      "",
      folders,
    );

    processor.processDocfiles();

    const generated = fs.readFileSync(path.join(folders.outFolder, "FixtureButton.md"), "utf8");

    expect(generated).toContain(
      "| [fontSize-FixtureButton](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |",
    );
    expect(generated).not.toContain(
      "[fontSize](/docs/styles-and-themes/common-units/#size-values)-FixtureButton",
    );
  });
});
