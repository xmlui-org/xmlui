import type { PlaygroundState } from "../state/store";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  type ComponentDef,
  type CompoundComponentDef,
  type ThemeDefinition,
  XmlUiHelper,
  type XmlUiNode,
} from "xmlui";
import { decompress } from "../playground/utils";
import { decodeFromBase64 } from "../../../../xmlui/src/components-core/utils/base64-utils";

export function normalizePath(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (typeof window === "undefined") {
    return url;
  }
  // @ts-ignore
  const prefix = window.__PUBLIC_PATH || "";
  if (!prefix) {
    return url;
  }
  const prefixWithoutTrailingSlash = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  const urlWithoutLeadingSlash = url.startsWith("/") ? url.slice(1) : url;

  return `${prefixWithoutTrailingSlash}/${urlWithoutLeadingSlash}`;
}

async function fetchWithoutCache(url: string) {
  return fetch(normalizePath(url) as any, {
    headers: {
      "Cache-Control": "no-cache, no-store",
    },
  });
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
  const decoded = decodeFromBase64(base64);
  if (!decoded) {
    throw new Error("Failed to decode base64 data");
  }
  const compressed = new TextEncoder().encode(decoded);
  return await decompress(compressed);
}

export const INITIAL_PLAYGROUND_STATE: PlaygroundState = {
  editorStatus: "idle",
  status: "idle",
  options: {
    orientation: "horizontal",
    swapped: false,
    content: "app",
    previewMode: false,
    id: 0,
    language: "xmlui",
  },
  text: "",
  appDescription: {
    config: {
      name: "",
      appGlobals: {},
      resources: {},
      themes: [],
    },
    components: [],
    app: "",
  },
  originalAppDescription: {
    config: {
      name: "",
      appGlobals: {},
      resources: {},
      themes: [],
    },
    components: [],
    app: "",
  },
  error: null,
};

function removeWhitespace(obj: any) {
  if (typeof obj === "string") {
    return obj.replace(/\s+/g, " ").trim(); // Remove extra whitespaces and newlines
  } else if (obj !== null && typeof obj === "object") {
    const newObj: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      newObj[key] = removeWhitespace(obj[key]);
    }
    return newObj;
  }
  return obj; // Return the value as is if not a string or object
}

export const handleDownloadZip = async (appDescription: any) => {
  const operatingSystem = getOperatingSystem();

  const zip = new JSZip();

  const xmluiFolder = zip.folder("xmlui");
  const xmluiStandalone = await fetchWithoutCache(
    "/resources/files/for-download/xmlui/xmlui-standalone.umd.js",
  ).then((res) => res.blob());
  xmluiFolder?.file("xmlui-standalone.umd.js", xmluiStandalone);

  zip.file("Main.xmlui", appDescription.app);
  zip.file("config.json", JSON.stringify(appDescription.config, null, 2));

  if (appDescription.components.length > 0) {
    const components = zip.folder("components");
    appDescription.components.forEach((component: { name: string; component: string }) => {
      components?.file(`${component.name}.xmlui`, component.component);
    });
  }
  if (appDescription.config.themes.length > 0) {
    const themes = zip.folder("themes");
    appDescription.config.themes.forEach((theme: ThemeDefinition) => {
      themes?.file(`${theme.id}.json`, JSON.stringify(theme, null, 2));
    });
  }

  const emulatedApi = appDescription.api;
  if (emulatedApi) {
    const indexWithApiHtml = await fetchWithoutCache(
      "/resources/files/for-download/index-with-api.html",
    ).then((res) => res.blob());
    zip.file("index.html", indexWithApiHtml);
    xmluiFolder?.file(
      "mockApiDef.js",
      `window.XMLUI_MOCK_API = ${JSON.stringify(removeWhitespace(emulatedApi), null, 2)};`,
    );

    const emulatedApiWorker = await fetchWithoutCache(
      "/resources/files/for-download/mockApi.js",
    ).then((res) => res.blob());
    zip.file("mockApi.js", emulatedApiWorker);
  } else {
    const indexHtml = await fetchWithoutCache("/resources/files/for-download/index.html").then(
      (res) => res.blob(),
    );
    zip.file("index.html", indexHtml);
  }

  const startBat = await fetchWithoutCache("/resources/files/for-download/start.bat").then((res) =>
    res.blob(),
  );

  if (operatingSystem === "Windows") {
    zip.file("start.bat", startBat);
  } else {
    let fileName = operatingSystem === "Linux" ? "start-linux.sh" : "start-darwin.sh";
    const startSh = await fetchWithoutCache(`/resources/files/for-download/${fileName}`).then(
      (res) => res.blob(),
    );
    zip.file("start.sh", startSh, {
      unixPermissions: "777",
    });
  }

  try {
    const content = await zip.generateAsync({
      type: "blob",
      platform: operatingSystem === "Windows" ? "DOS" : "UNIX",
    });
    saveAs(content, `${(appDescription.config.name || "xmlui-playground-app").trim()}.zip`);
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
      .filter((line) => line.trim() !== "") // Ignore empty lines for indentation
      .map((line) => line.match(/^\s*/)?.[0].length || 0), // Count leading spaces
  );

  // Remove minIndent spaces from the beginning of each line
  const result = trimmedLines.map((line) =>
    line.startsWith(" ".repeat(minIndent)) ? line.slice(minIndent) : line,
  );

  // Join lines back into a single string
  return result.join("\n");
}

function getOperatingSystem() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;

  if (/Win/.test(platform)) {
    return "Windows";
  }
  if (/Mac/.test(platform)) {
    return "MacOS";
  }
  if (/Linux/.test(platform)) {
    return "Linux";
  }
  if (/Android/.test(userAgent)) {
    return "Android";
  }
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return "iOS";
  }
  return "Unknown OS";
}
