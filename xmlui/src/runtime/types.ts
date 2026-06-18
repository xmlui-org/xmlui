import type { XmluiDocument, XmluiElement } from "../compiler/ir";

export type XmluiModule =
  | {
      kind: "app";
      root: XmluiElement;
      components: Record<string, XmluiComponentModule>;
    }
  | XmluiComponentModule;

export type XmluiComponentModule = {
  kind: "component";
  name: string;
  root: XmluiElement;
};

export type XmluiDocumentInput = XmluiDocument;
