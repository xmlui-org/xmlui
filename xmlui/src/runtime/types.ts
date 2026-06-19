import type { XmluiDocument, XmluiElement } from "../compiler/ir";
import type { XmluiExtensionComponent } from "../extensions";

export type XmluiModule =
  | {
      kind: "app";
      root: XmluiElement;
      components: Record<string, XmluiComponentModule>;
      extensionRenderers?: Record<string, XmluiExtensionComponent>;
      extensionFunctions?: Record<string, (...args: unknown[]) => unknown>;
    }
  | XmluiComponentModule;

export type XmluiComponentModule = {
  kind: "component";
  name: string;
  root: XmluiElement;
};

export type XmluiDocumentInput = XmluiDocument;
