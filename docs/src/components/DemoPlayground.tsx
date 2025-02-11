import React, { useEffect, useId, useMemo, useReducer } from "react";
// import "../index.scss";
import {
  appDescriptionInitialized,
  optionsInitialized,
  PlaygroundContext,
  playgroundReducer,
} from "../state/store";
import { INITIAL_PLAYGROUND_STATE, preprocessCode } from "../../src/utils/helpers";
import { ToastProvider } from "@radix-ui/react-toast";
import { PlaygroundContent } from "../../src/components/PlaygroundContent";
import { Header } from "../../src/components/Header";
import styles from "./StandalonePlayground.module.scss";
import type { ApiInterceptorDefinition } from "../../../xmlui/src/components-core/interception/abstractions";
import type { ThemeDefinition } from "../../../xmlui/src/components-core/theming/abstractions";
import { ErrorBoundary } from "../../../xmlui/src/components-core/rendering/ErrorBoundary";

type DemoPlaygroundProps = {
  name: string;
  description?: string;
  app: string;
  api?: ApiInterceptorDefinition;
  themes?: ThemeDefinition[];
  defaultTheme?: string;
  defaultTone?: string;
  resources?: any;
  components: string[];
  previewOnly?: boolean;
  height?: number | string;
  initialEditorHeight?: string;
  swapped?: boolean;
  horizontal?: boolean;
  allowStandalone?: boolean;
  fixedTheme?: boolean;
};

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

export const DemoPlayground = ({
  name,
  description,
  app,
  themes = EMPTY_ARRAY,
  defaultTheme,
  defaultTone,
  resources = EMPTY_OBJECT,
  previewOnly = false,
  components = EMPTY_ARRAY,
  swapped = false,
  horizontal = false,
  allowStandalone = true,
  api,
  fixedTheme = false,
}: DemoPlaygroundProps) => {
  const [playgroundState, dispatch] = useReducer(playgroundReducer, INITIAL_PLAYGROUND_STATE);

  const id = useId();

  useEffect(() => {
    if (app) {
      console.log("hahaha", preprocessCode(app));
      dispatch(
        appDescriptionInitialized({
          config: {
            name,
            description,
            logo: null,
            appGlobals: {},
            resources,
            themes,
            defaultTone,
            defaultTheme,
          },
          components: components.map((c) => preprocessCode(c)),
          app: preprocessCode(app),
          api,
        }),
      );

      dispatch(
        optionsInitialized({
          orientation: horizontal ? "horizontal" : "vertical",
          swapped,
          activeTheme: defaultTheme,
          activeTone: defaultTone,
          content: "app",
          previewMode: previewOnly,
          allowStandalone,
          id: 0,
          language: "ueml",
          fixedTheme,
        }),
      );
    }

    //TODO illesg, review (dep array?)!!!
  }, [
    allowStandalone,
    api,
    app,
    components,
    defaultTheme,
    defaultTone,
    description,
    fixedTheme,
    horizontal,
    name,
    previewOnly,
    resources,
    swapped,
    themes,
  ]);

  const playgroundContextValue = useMemo(() => {
    return {
      editorStatus: playgroundState.editorStatus,
      playgroundId: id,
      status: playgroundState.status,
      options: playgroundState.options,
      text: playgroundState.text,
      originalAppDescription: playgroundState.originalAppDescription,
      appDescription: playgroundState.appDescription,
      dispatch,
    };
  }, [
    id,
    playgroundState.editorStatus,
    playgroundState.status,
    playgroundState.options,
    playgroundState.text,
    playgroundState.originalAppDescription,
    playgroundState.appDescription,
  ]);

  useEffect(() => {
    document.documentElement.style.scrollbarGutter = "auto";

    return () => {
      document.documentElement.style.scrollbarGutter = "";
    };
  }, []);

  return (
    <ToastProvider>
      <PlaygroundContext.Provider value={playgroundContextValue}>
        <ErrorBoundary>
          <div className={styles.standalonePlayground}>
            {!previewOnly && <Header standalone={true} />}
            <div style={{ flexGrow: 1, overflow: "auto" }}>
              <PlaygroundContent standalone={true} />
            </div>
          </div>
        </ErrorBoundary>
      </PlaygroundContext.Provider>
    </ToastProvider>
  );
};
