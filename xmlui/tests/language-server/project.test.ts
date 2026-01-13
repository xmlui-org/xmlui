import { describe, it, expect } from "vitest";
import { Project } from "../../src/language-server/base/project";

describe("Project and DocumentStore", () => {
  it("retriesves a document content", () => {
    const proj = Project.fromFileContets({
      "Main.xmlui": `<Button/>`,
    });

    expect(proj.documents.get("Main.xmlui").getText()).toEqual(`<Button/>`);
  });

  it("parses a document", () => {
    const proj = Project.fromFileContets({
      "Main.xmlui": `<Button/>`,
    });

    const { getText, parseResult } = proj.documents.get("Main.xmlui").parse();

    const compNameNode = parseResult.node.children![0].children![1];
    expect(getText(compNameNode)).toEqual("Button");
  });

  it("gets a document by component name", () => {
    const proj = Project.fromFileContets({
      "MyButton.xmlui": `<Component name="MyButton"><Button label="My"/></Component>`,
    });

    const content = proj.documents.getByCompName("MyButton").getText();

    expect(content).toEqual(`<Component name="MyButton"><Button label="My"/></Component>`);
  });

  it("searches for a component name in the contents", () => {
    const proj = Project.fromFileContets({
      "AAAAAAA.xmlui": `<Component name="MyButton"><Button label="My"/></Component>`,
    });

    const content = proj.documents.getByCompName("MyButton").getText();

    expect(content).toEqual(`<Component name="MyButton"><Button label="My"/></Component>`);
  });

  it("document cursor computes line-char from offset", () => {
    const content = `<Button>\n</Button>`;
    const proj = Project.fromFileContets({ "Main.xmlui": content });

    const slashCharOffset = content.indexOf("/");
    const pos = proj.documents.get("Main.xmlui").cursor.offsetToDisplayPos(slashCharOffset);

    expect(pos).toEqual({ line: 2, character: 2 });
  });
});
