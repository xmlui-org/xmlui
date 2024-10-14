import { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { XmlUiHelper } from "@src/parsers/xmlui-parser/xmlui-serializer";
import { decompress } from "@/src/components/utils";
import { ThemeDefinition } from "@components-core/theming/abstractions";
import { PlaygroundState } from "@/src/state/store";
import { SolidThemeDefinition } from "@components-core/theming/themes/solid";
import { XmlUiThemeDefinition } from "@components-core/theming/themes/xmlui";
import { xmlUiMarkupToComponent } from "@components-core/xmlui-parser";
import { XmlUiNode } from "@src/parsers/xmlui-parser/xmlui-tree";

export function parseFromEditorText(value: string = "") {
  try {
    const {component, errors} =  xmlUiMarkupToComponent(value);
    if (errors.length > 0) {
      return {}
    }
    return component
  } catch (e) {
    console.log(e);
    return {};
  }
}

export function serialize(component: ComponentDef | CompoundComponentDef): string {
  if (component) {
    const xh = new XmlUiHelper();
    try {
      const node = xh.transformComponentDefinition(component) as XmlUiNode;
      return xh.serialize(node, { prettify: true });
    } catch (e) {
      console.log(e);
      return "";
    }
  }
  return "";
}

export async function decompressData(source: string) {
  const base64 = decodeURIComponent(source);
  const compressed = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return await decompress(compressed);
}

export const builtInThemes: Array<ThemeDefinition> = [
  { ...SolidThemeDefinition, name: "Solid" },
  { ...XmlUiThemeDefinition, name: "Xmlui" },
];

export const INITIAL_PLAYGROUND_STATE: PlaygroundState = {
  status: "idle",
  options: {
    orientation: "horizontal",
    swapped: false,
    content: "app",
    previewMode: false,
    id: 0,
    language: "ueml",
  },
  text: "",
  appDescription: {
    config: {
      name: "",
      globals: {},
      resources: {},
      themes: [],
    },
    components: [],
    app: "",
  },
  originalAppDescription: {
    config: {
      name: "",
      globals: {},
      resources: {},
      themes: [],
    },
    components: [],
    app: "",
  },
};
