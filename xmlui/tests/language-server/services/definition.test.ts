import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { pathToFileURL } from "url";
import { handleDefinition } from "../../../src/language-server/services/definition";
import { Project } from "../../../src/language-server/base/project";
import { mockMetadataProvider } from "../mockData";

// Helper: create a temp dir, write the given files, return the dir path.
function makeProjectDir(files: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "xmlui-def-"));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
  return root;
}

function uriOf(root: string, rel: string): string {
  return pathToFileURL(path.join(root, rel)).toString();
}

describe("Definition", () => {
  const tempRoots: string[] = [];

  afterAll(() => {
    for (const root of tempRoots) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("scopes resolution to the requesting project", () => {
    const projectAFiles = {
      "Main.xmlui": "<App><MyButton/></App>",
      "MyButton.xmlui": "<Component name=\"MyButton\"><Stack/></Component>",
    };
    const projectBFiles = {
      "Main.xmlui": "<App/>",
      "MyButton.xmlui": "<Component name=\"MyButton\"><Stack/></Component>",
    };

    const rootA = makeProjectDir(projectAFiles);
    const rootB = makeProjectDir(projectBFiles);
    tempRoots.push(rootA, rootB);

    const mainAUri = uriOf(rootA, "Main.xmlui");
    const buttonAUri = uriOf(rootA, "MyButton.xmlui");
    const buttonBUri = uriOf(rootB, "MyButton.xmlui");

    const project = Project.fromFileContets(
      {
        [mainAUri]: projectAFiles["Main.xmlui"],
        [buttonAUri]: projectAFiles["MyButton.xmlui"],
        [buttonBUri]: projectBFiles["MyButton.xmlui"],
      },
      mockMetadataProvider,
    );

    // Position the cursor inside the `MyButton` tag name in Main.xmlui
    const source = projectAFiles["Main.xmlui"];
    const cursorOffset = source.indexOf("MyButton") + 1;
    const doc = project.documents.get(mainAUri);
    const position = doc.cursor.positionAt(cursorOffset);

    const result = handleDefinition(project, mainAUri, position);
    expect(result).not.toBeNull();
    expect(result!.uri).toBe(buttonAUri);
  });

  it("returns a range pointing to the Component tag, not the start of file", () => {
    const componentSource =
      "\n\n  <Component name=\"MyButton\"><Stack/></Component>";
    const files = {
      "Main.xmlui": "<App><MyButton/></App>",
      "MyButton.xmlui": componentSource,
    };
    const root = makeProjectDir(files);
    tempRoots.push(root);

    const mainUri = uriOf(root, "Main.xmlui");
    const buttonUri = uriOf(root, "MyButton.xmlui");

    const project = Project.fromFileContets(
      {
        [mainUri]: files["Main.xmlui"],
        [buttonUri]: componentSource,
      },
      mockMetadataProvider,
    );

    const source = files["Main.xmlui"];
    const cursorOffset = source.indexOf("MyButton") + 1;
    const doc = project.documents.get(mainUri);
    const position = doc.cursor.positionAt(cursorOffset);

    const result = handleDefinition(project, mainUri, position);
    expect(result).not.toBeNull();
    expect(result!.uri).toBe(buttonUri);

    // The range should point to "Component" in `<Component …>`, not (0,0).
    const targetDoc = project.documents.get(buttonUri);
    const startOffset = targetDoc.cursor.offsetAt(result!.range.start);
    const endOffset = targetDoc.cursor.offsetAt(result!.range.end);
    expect(componentSource.slice(startOffset, endOffset)).toBe("Component");
  });

  it("resolves to a component whose declared name differs from its filename", () => {
    // MyText13.xmlui declares name="MyText"; goto-definition for <MyText/> should find it
    const componentSource = '<Component name="MyText"><Text>MyText</Text></Component>';
    const files = {
      "Main.xmlui": "<App><MyText/></App>",
      "MyText13.xmlui": componentSource,
    };
    const root = makeProjectDir(files);
    tempRoots.push(root);

    const mainUri = uriOf(root, "Main.xmlui");
    const componentUri = uriOf(root, "MyText13.xmlui");

    const project = Project.fromFileContets(
      {
        [mainUri]: files["Main.xmlui"],
        [componentUri]: componentSource,
      },
      mockMetadataProvider,
    );

    const source = files["Main.xmlui"];
    const cursorOffset = source.indexOf("MyText") + 1;
    const doc = project.documents.get(mainUri);
    const position = doc.cursor.positionAt(cursorOffset);

    const result = handleDefinition(project, mainUri, position);
    expect(result).not.toBeNull();
    expect(result!.uri).toBe(componentUri);
  });

  it("returns null for an unknown component", () => {
    const files = {
      "Main.xmlui": "<App><Unknown/></App>",
    };
    const root = makeProjectDir(files);
    tempRoots.push(root);

    const mainUri = uriOf(root, "Main.xmlui");
    const project = Project.fromFileContets(
      { [mainUri]: files["Main.xmlui"] },
      mockMetadataProvider,
    );

    const source = files["Main.xmlui"];
    const cursorOffset = source.indexOf("Unknown") + 1;
    const doc = project.documents.get(mainUri);
    const position = doc.cursor.positionAt(cursorOffset);

    const result = handleDefinition(project, mainUri, position);
    expect(result).toBeNull();
  });

  it("returns null for a built-in component with no .xmlui file", () => {
    const files = {
      "Main.xmlui": "<App><Stack/></App>",
    };
    const root = makeProjectDir(files);
    tempRoots.push(root);

    const mainUri = uriOf(root, "Main.xmlui");
    const project = Project.fromFileContets(
      { [mainUri]: files["Main.xmlui"] },
      mockMetadataProvider,
    );

    const source = files["Main.xmlui"];
    const cursorOffset = source.indexOf("Stack") + 1;
    const doc = project.documents.get(mainUri);
    const position = doc.cursor.positionAt(cursorOffset);

    const result = handleDefinition(project, mainUri, position);
    expect(result).toBeNull();
  });
});
