import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { XmlUiHelper } from "@src/parsers/xmlui-parser/xmlui-serializer";
import { decompress } from "@/src/components/utils";
import type { ThemeDefinition } from "@components-core/theming/abstractions";
import type { PlaygroundState } from "@/src/state/store";
import { SolidThemeDefinition } from "@components-core/theming/themes/solid";
import { XmlUiThemeDefinition } from "@components-core/theming/themes/xmlui";
import type { XmlUiNode } from "@src/parsers/xmlui-parser/xmlui-tree";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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
  editorStatus: "idle",
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

export const handleDownloadZip = async (appDescription: any) => {
  const zip = new JSZip();
  const emulatedApi = appDescription.api;

  if (emulatedApi) {
    const indexWithApiHtml = await fetch("/resources/files/for-download/index-with-api.html").then(
      (res) => res.blob(),
    );
    zip.file("index.html", indexWithApiHtml);
    zip.file("emulatedApi.js", JSON.stringify(emulatedApi, null, 2));
    const emulatedApiWorker = await fetch(
      "/resources/files/for-download/emulatedApiWorker.js",
    ).then((res) => res.blob());
    zip.file("emulatedApiWorker.js", emulatedApiWorker);
  } else {
    const indexHtml = await fetch("/resources/files/for-download/index.html").then((res) =>
      res.blob(),
    );
    zip.file("index.html", indexHtml);
  }

  const startBat = await fetch("/resources/files/for-download/start.bat").then((res) => res.blob());
  const startSh = await fetch("/resources/files/for-download/start.sh").then((res) => res.blob());
  zip.file("start.bat", startBat);
  zip.file("start.sh", startSh);

  const xmluiFolder = zip.folder("xmlui");
  const xmluiStandalone = await fetch(
    "/resources/files/for-download/xmlui/xmlui-standalone.umd.js",
  ).then((res) => res.blob());
  xmluiFolder.file("xmlui-standalone.umd.js", xmluiStandalone);

  zip.file("Main.xmlui", appDescription.app);
  zip.file("config.json", JSON.stringify(appDescription.config, null, 2));

  if (appDescription.components.length > 0) {
    const components = zip.folder("components");
    appDescription.components.forEach((component: { name: string; component: string }) => {
      components.file(`${component.name}.xmlui`, component.component);
    });
  }
  if (appDescription.config.themes.length > 0) {
    const themes = zip.folder("themes");
    appDescription.config.themes.forEach((theme: ThemeDefinition) => {
      themes.file(`${theme.id}.json`, JSON.stringify(theme, null, 2));
    });
  }
  try {
    const content = await zip.generateAsync({ type: "blob" });

    saveAs(content, `${appDescription.config.name.trim()}.zip`);
  } catch (error) {
    console.error("An error occurred while generating the ZIP:", error);
  }
};

export function preprocessCode(code: string): string {
  // Split code by newlines
  const lines = code.split("\n");

  // Remove whitespace-only lines from the beginning and end
  let start = 0;
  while (start < lines.length && lines[start].trim() === "") {
    start++;
  }

  let end = lines.length - 1;
  while (end >= 0 && lines[end].trim() === "") {
    end--;
  }

  const trimmedLines = lines.slice(start, end + 1);

  // Calculate the minimum indentation
  const minIndent = Math.min(
      ...trimmedLines
          .filter(line => line.trim() !== "") // Ignore empty lines for indentation
          .map(line => line.match(/^\s*/)[0].length) // Count leading spaces
  );

  // Remove minIndent spaces from the beginning of each line
  const result = trimmedLines.map(line =>
      line.startsWith(" ".repeat(minIndent)) ? line.slice(minIndent) : line
  );

  // Join lines back into a single string
  return result.join("\n");
}
