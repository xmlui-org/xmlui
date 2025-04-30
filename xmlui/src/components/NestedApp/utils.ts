import type { ThemeDefinition } from "../../abstractions/ThemingDefs";
import type { Dispatch } from "react";
import { createContext } from "react";
import produce from "immer";
import type { CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { errReportComponent, xmlUiMarkupToComponent } from "../../components-core/xmlui-parser";
import type { ApiInterceptorDefinition } from "../../components-core/interception/abstractions";
import { useContext } from "react";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { XmlUiHelper } from "../../parsers/xmlui-parser/xmlui-serializer";
import { SolidThemeDefinition } from "../../components-core/theming/themes/solid";
import { XmlUiThemeDefinition } from "../../components-core/theming/themes/xmlui";
import type { XmlUiNode } from "../../parsers/xmlui-parser/xmlui-tree";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {normalizePath} from "../../components-core/utils/misc";

type Orientation = "horizontal" | "vertical";

type Options = {
  previewMode?: boolean;
  swapped?: boolean;
  orientation?: Orientation;
  content: string;
  allowStandalone?: boolean;
  id: number;
  activeTheme?: string;
  activeTone?: string;
  language: "xmlui" | "json";
  emulatedApi?: string;
  fixedTheme?: boolean;
};

type AppDescription = {
  config: {
    name: string;
    description?: string;
    appGlobals: any;
    resources: any;
    themes: ThemeDefinition[];
    defaultTheme?: string;
    defaultTone?: string;
  };
  components: any[];
  app: any;
  availableThemes?: Array<ThemeDefinition>;
  api?: ApiInterceptorDefinition;
};

export interface IPlaygroundContext {
  status: "loading" | "loaded" | "idle";
  editorStatus?: "loading" | "loaded" | "idle";
  appDescription: AppDescription;
  originalAppDescription: AppDescription;
  dispatch: Dispatch<PlaygroundAction>;
  text: string;
  options: Options;
  playgroundId: string;
}

export const PlaygroundContext = createContext<IPlaygroundContext>(
  undefined as unknown as IPlaygroundContext,
);

enum PlaygroundActionKind {
  TEXT_CHANGED = "PlaygroundActionKind:TEXT_CHANGED",
  CONTENT_CHANGED = "PlaygroundActionKind:CONTENT_CHANGED",
  PREVIEW_MODE = "PlaygroundActionKind:PREVIEW_MODE",
  RESET_APP = "PlaygroundActionKind:RESET_APP",
  APP_SWAPPED = "PlaygroundActionKind:APP_SWAPPED",
  ORIENTATION_CHANGED = "PlaygroundActionKind:ORIENTATION_CHANGED",
  APP_DESCRIPTION_INITIALIZED = "PlaygroundActionKind:APP_DESCRIPTION_INITIALIZED",
  EDITOR_STATUS_CHANGED = "PlaygroundActionKind:EDITOR_STATUS_CHANGED",
  OPTIONS_INITIALIZED = "PlaygroundActionKind:OPTIONS_INITIALIZED",
  ACTIVE_THEME_CHANGED = "PlaygroundActionKind:ACTIVE_THEME_CHANGED",
  TONE_CHANGED = "PlaygroundActionKind:TONE_CHANGED",
}

type PlaygroundAction = {
  type: PlaygroundActionKind;
  payload: {
    text?: string;
    appDescription?: AppDescription;
    options?: Options;
    activeTone?: string;
    activeTheme?: string;
    content?: string;
    themes?: ThemeDefinition[];
    previewMode?: boolean;
    editorStatus?: "loading" | "loaded";
  };
};

export interface PlaygroundState {
  editorStatus: "loading" | "loaded" | "idle";
  status: "loading" | "loaded" | "idle";
  text: string;
  appDescription: AppDescription;
  originalAppDescription: AppDescription;
  options: Options;
}

export function toneChanged(activeTone: string) {
  return {
    type: PlaygroundActionKind.TONE_CHANGED,
    payload: {
      activeTone,
    },
  };
}

export function textChanged(text: string) {
  return {
    type: PlaygroundActionKind.TEXT_CHANGED,
    payload: {
      text,
    },
  };
}

export function contentChanged(content: string) {
  return {
    type: PlaygroundActionKind.CONTENT_CHANGED,
    payload: {
      content,
    },
  };
}

export function previewMode(previewMode: boolean) {
  return {
    type: PlaygroundActionKind.PREVIEW_MODE,
    payload: {
      previewMode,
    },
  };
}

export function resetApp() {
  return {
    type: PlaygroundActionKind.RESET_APP,
    payload: {},
  };
}

export function swapApp() {
  return {
    type: PlaygroundActionKind.APP_SWAPPED,
    payload: {},
  };
}

export function changeOrientation() {
  return {
    type: PlaygroundActionKind.ORIENTATION_CHANGED,
    payload: {},
  };
}

export function appDescriptionInitialized(appDescription: any) {
  return {
    type: PlaygroundActionKind.APP_DESCRIPTION_INITIALIZED,
    payload: {
      appDescription,
    },
  };
}

export function optionsInitialized(options: Options) {
  return {
    type: PlaygroundActionKind.OPTIONS_INITIALIZED,
    payload: {
      options,
    },
  };
}

export function activeThemeChanged(activeTheme: string) {
  return {
    type: PlaygroundActionKind.ACTIVE_THEME_CHANGED,
    payload: {
      activeTheme,
    },
  };
}

export function editorStatusChanged(editorStatus: "loading" | "loaded") {
  return {
    type: PlaygroundActionKind.EDITOR_STATUS_CHANGED,
    payload: {
      editorStatus,
    },
  };
}

export const playgroundReducer = produce((state: PlaygroundState, action: PlaygroundAction) => {
  switch (action.type) {
    case PlaygroundActionKind.EDITOR_STATUS_CHANGED: {
      state.editorStatus = action.payload.editorStatus || "idle";
      break;
    }
    case PlaygroundActionKind.APP_DESCRIPTION_INITIALIZED: {
      state.status = "loading";
      if (action.payload.appDescription) {
        const compoundComponents: CompoundComponentDef[] =
          action.payload.appDescription.components.map((src) => {
            if (typeof src === "string") {
              let { errors, component, erroneousCompoundComponentName } =
                xmlUiMarkupToComponent(src);
              if (errors.length > 0) {
                return errReportComponent(
                  errors,
                  "Preview source file",
                  erroneousCompoundComponentName,
                );
              }
              return {
                name: (component as CompoundComponentDef).name,
                component: src,
              };
            }
            return src;
          });
        state.appDescription.components = compoundComponents;
        state.appDescription.app = action.payload.appDescription.app;
        state.appDescription.config = action.payload.appDescription.config;
        state.appDescription.api = action.payload.appDescription.api;
        state.text = action.payload.appDescription.app;
        const themes = action.payload.appDescription.config.themes || [];
        state.appDescription.availableThemes = [...themes, ...builtInThemes];
        state.options.activeTheme =
          state.appDescription.config.defaultTheme || state.appDescription.availableThemes[0].id;
        state.originalAppDescription = { ...state.appDescription };
      }
      state.status = "loaded";
      break;
    }
    case PlaygroundActionKind.OPTIONS_INITIALIZED: {
      state.options = action.payload.options || state.options;
      break;
    }
    case PlaygroundActionKind.ACTIVE_THEME_CHANGED: {
      if (action.payload.activeTheme) {
        state.options.activeTheme = action.payload.activeTheme;
      }
      break;
    }
    case PlaygroundActionKind.PREVIEW_MODE: {
      state.options.previewMode = action.payload.previewMode || false;
      break;
    }
    case PlaygroundActionKind.APP_SWAPPED: {
      state.options.swapped = !state.options.swapped;
      break;
    }
    case PlaygroundActionKind.ORIENTATION_CHANGED: {
      state.options.orientation =
        state.options.orientation === "horizontal" ? "vertical" : "horizontal";
      break;
    }
    case PlaygroundActionKind.RESET_APP: {
      state.options.id = state.options.id + 1;
      state.appDescription = { ...state.originalAppDescription };
      if (state.options.content === "app") {
        state.text = state.originalAppDescription.app;
      }
      if (state.options.content === "config") {
        state.text = JSON.stringify(state.originalAppDescription.config, null, 2);
      } else if (
        state.appDescription.components
          .map((c) => c.name.toLowerCase())
          .includes(state.options.content?.toLowerCase())
      ) {
        state.text =
          state.originalAppDescription.components.find(
            (component: CompoundComponentDef) => component.name === state.options.content,
          )?.component || "";
      }
      break;
    }
    case PlaygroundActionKind.CONTENT_CHANGED: {
      state.options.content = action.payload.content || "app";
      if (state.options.content === "app") {
        state.text = state.appDescription.app;
        state.options.language = "xmlui";
      } else if (state.options.content === "config") {
        state.text = JSON.stringify(state.appDescription.config, null, 2);
        state.options.language = "json";
      } else if (
        state.appDescription.components
          .map((c) => c.name.toLowerCase())
          .includes(state.options.content?.toLowerCase())
      ) {
        state.text =
          state.appDescription.components.find(
            (component: CompoundComponentDef) => component.name === state.options.content,
          )?.component || "";
        state.options.language = "xmlui";
      } else if (
        state.appDescription.config.themes
          .map((t) => t.id.toLowerCase())
          .includes(state.options.content?.toLowerCase())
      ) {
        state.text = JSON.stringify(
          state.appDescription.config.themes.find(
            (theme: ThemeDefinition) => theme.id === state.options.content,
          ),
          null,
          2,
        );
        state.options.language = "json";
      }
      break;
    }
    case PlaygroundActionKind.TONE_CHANGED: {
      state.options.id = state.options.id + 1;
      state.options.activeTone = action.payload.activeTone;
      break;
    }
    case PlaygroundActionKind.TEXT_CHANGED:
      state.options.id = state.options.id + 1;
      {
        state.text = action.payload.text || "";
        if (state.options.content === "app") {
          state.appDescription.app = state.text;
        } else if (state.options.content === "config") {
          try {
            state.appDescription.config = JSON.parse(state.text || "");
          } catch (e) {
            console.log(e);
          }
        } else if (
          state.appDescription.components?.some(
            (component: CompoundComponentDef) => component.name === state.options.content,
          )
        ) {
          state.appDescription.components = state.appDescription.components.map(
            (component: CompoundComponentDef) => {
              if (component.name === state.options.content) {
                return {
                  name: component.name,
                  component: state.text || "",
                };
              }
              return component;
            },
          );
        } else if (
          state.appDescription.config.themes?.some(
            (theme: ThemeDefinition) => theme.id === state.options.content,
          )
        ) {
          try {
            state.appDescription.config.themes = state.appDescription.config.themes.map(
              (theme: ThemeDefinition) => {
                if (theme.id === state.options.content) {
                  return JSON.parse(state.text || "");
                }
                return theme;
              },
            );
          } catch (e) {
            console.log(e);
          }
        }
      }
      break;
  }
});

export const usePlayground = () => {
  const context = useContext(PlaygroundContext);
  if (context === undefined) {
    throw new Error("usePlayground must be used within a PlaygroundProvider");
  }

  return context;
};

/**
 * Convert a string to its UTF-8 bytes and compress it.
 *
 * @param {string} str
 * @returns {Promise<Uint8Array>}
 */
export async function compress(str: string) {
  // Convert the string to a byte stream.
  const stream = new Blob([str]).stream();

  // Create a compressed stream.
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));

  // Convert the string to a byte stream.
  const reader = compressedStream.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return await concatUint8Arrays(chunks);
}

/**
 * Decompress bytes into a UTF-8 string.
 *
 * @param {Uint8Array} compressedBytes
 * @returns {Promise<string>}
 */
export async function decompress(compressedBytes: Uint8Array) {
  // Convert the bytes to a stream.
  const stream = new Blob([compressedBytes]).stream();

  // Create a decompressed stream.
  const decompressedStream = stream.pipeThrough(new DecompressionStream("gzip"));

  // Convert the string to a byte stream.
  const reader = decompressedStream.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const stringBytes = await concatUint8Arrays(chunks);

  // Convert the bytes to a string.
  return new TextDecoder().decode(stringBytes);
}

/**
 * Combine multiple Uint8Arrays into one.
 *
 * @param {ReadonlyArray<Uint8Array>} uint8arrays
 * @returns {Promise<Uint8Array>}
 */
async function concatUint8Arrays(uint8arrays: Uint8Array[]) {
  const blob = new Blob(uint8arrays);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function createQueryString(target: any) {
  // Convert the Uint8Array to a Base64 string.

  const compressed = await compress(target);
  const base64 = btoa(String.fromCharCode(...compressed));

  // Create a query string.
  return encodeURIComponent(base64);
}

async function fetchWithoutCache(url: string) {
  return fetch(normalizePath(url), {
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
};

function removeWhitespace(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/\s+/g, ' ').trim(); // Remove extra whitespaces and newlines
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = Array.isArray(obj) ? [] : {};
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

  const emulatedApi = appDescription.api;
  if (emulatedApi) {
    const indexWithApiHtml = await fetchWithoutCache("/resources/files/for-download/index-with-api.html").then(
        (res) => res.blob(),
    );
    zip.file("index.html", indexWithApiHtml);
    xmluiFolder.file("mockApiDef.js", `window.XMLUI_MOCK_API = ${JSON.stringify(removeWhitespace(emulatedApi), null, 2)};`);

    const emulatedApiWorker = await fetchWithoutCache(
        "/resources/files/for-download/mockApi.js",
    ).then((res) => res.blob());
    zip.file("mockApi.js", emulatedApiWorker);
  } else {
    const indexHtml = await fetchWithoutCache("/resources/files/for-download/index.html").then((res) =>
        res.blob(),
    );
    zip.file("index.html", indexHtml);
  }

  const startBat = await fetchWithoutCache("/resources/files/for-download/start.bat").then((res) => res.blob());

  if (operatingSystem === "Windows") {
    zip.file("start.bat", startBat);
  } else {
    let fileName = operatingSystem === "Linux" ? "start-linux.sh" : "start-darwin.sh";
    const startSh = await fetchWithoutCache(`/resources/files/for-download/${fileName}`).then((res) => res.blob());
    zip.file("start.sh", startSh, {
      unixPermissions: "777"
    });
  }

  try {
    const content = await zip.generateAsync({ type: "blob", platform: operatingSystem === "Windows" ? "DOS" : "UNIX" });
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

