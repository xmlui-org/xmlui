import type { ThemeDefinition } from "@components-core/theming/abstractions";
import { createContext, Dispatch } from "react";
import produce from "immer";
import { CompoundComponentDef } from "@abstractions/ComponentDefs";
import { builtInThemes } from "../utils/helpers";
import { errReportComponent, xmlUiMarkupToComponent } from "@components-core/xmlui-parser";

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
  language: "ueml" | "json";
};

type AppDescription = {
  config: {
    name: string;
    description?: string;
    globals: any;
    resources: any;
    themes: ThemeDefinition[];
    defaultTheme?: string;
    defaultTone?: string;
  };
  components: any[];
  app: any;
  availableThemes?: Array<ThemeDefinition>;
};

export interface IPlaygroundContext {
  status: "loading" | "loaded" | "idle";
  appDescription: AppDescription;
  originalAppDescription: AppDescription;
  dispatch: Dispatch<PlaygroundAction>;
  text: string;
  options: Options;
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
  };
};

export interface PlaygroundState {
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

export const playgroundReducer = produce((state: PlaygroundState, action: PlaygroundAction) => {
  switch (action.type) {
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
                  "somewhere in preview",
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
        state.text = action.payload.appDescription.app;
        const themes = action.payload.appDescription.config.themes || [];
        state.appDescription.availableThemes = themes.length > 0 ? themes : builtInThemes;
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
      }
      break;
    }
    case PlaygroundActionKind.CONTENT_CHANGED: {
      state.options.content = action.payload.content || "app";
      if (state.options.content === "app") {
        state.text = state.appDescription.app;
        state.options.language = "ueml";
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
        state.options.language = "ueml";
      }
      break;
    }
    case PlaygroundActionKind.TONE_CHANGED: {
      state.options.id = state.options.id + 1;
      state.options.activeTone = action.payload.activeTone;
      break;
    }
    case PlaygroundActionKind.TEXT_CHANGED:
      {
        state.text = action.payload.text || "";
        if (state.options.content === "app") {
          state.appDescription.app = state.text;
        }
        if (state.options.content === "config") {
          try {
            state.appDescription.config = JSON.parse(state.text || "");
          } catch (e) {
            console.log(e);
          }
        }
        if (
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
        }
        if (
          state.appDescription.config.themes?.some(
            (theme: ThemeDefinition) => theme.name === state.options.content,
          )
        ) {
          state.appDescription.config.themes = state.appDescription.config.themes.map(
            (theme: ThemeDefinition) => {
              if (theme.name === state.options.content) {
                return JSON.parse(state.text || "");
              }
              return theme;
            },
          );
        }
      }
      break;
  }
});
