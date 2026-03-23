import { useEffect, useId, useMemo, useReducer } from "react";
import {
  appDescriptionInitialized,
  optionsInitialized,
  PlaygroundContext,
  playgroundReducer,
} from "../state/store";
import { INITIAL_PLAYGROUND_STATE, preprocessCode } from "../utils/helpers";
import styles from "./PlaygroundNative.module.scss";
import type { ApiInterceptorDefinition, ThemeDefinition, ThemeTone } from "xmlui";
import { ErrorBoundary } from "xmlui";
import { PlaygroundContent } from "./PlaygroundContent";
import { Header } from "./Header";

type PlaygroundProps = {
  name: string;
  description?: string;
  app: string;
  api?: ApiInterceptorDefinition;
  themes?: ThemeDefinition[];
  defaultTheme?: string;
  defaultTone?: ThemeTone;
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

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT = {};

export const Playground = ({
  name,
  description,
  app,
  themes = EMPTY_ARRAY,
  defaultTheme,
  defaultTone,
  resources = EMPTY_OBJECT,
  previewOnly = false,
  components = EMPTY_ARRAY,
  height,
  initialEditorHeight = "50%",
  swapped = false,
  horizontal = false,
  allowStandalone = true,
  api,
  fixedTheme = false,
}: PlaygroundProps) => {
  const id = useId();

  const initializationProps = useMemo(
    () => ({
      name,
      description,
      app,
      themes,
      defaultTheme,
      defaultTone,
      resources,
      previewOnly,
      components,
      initialEditorHeight,
      swapped,
      horizontal,
      allowStandalone,
      api,
      fixedTheme,
    }),
    [
      name,
      description,
      app,
      themes,
      defaultTheme,
      defaultTone,
      resources,
      previewOnly,
      components,
      initialEditorHeight,
      swapped,
      horizontal,
      allowStandalone,
      api,
      fixedTheme,
    ],
  );

  useEffect(() => {
    if (initializationProps.app) {
      dispatch(
        appDescriptionInitialized({
          config: {
            name: initializationProps.name,
            description: initializationProps.description,
            logo: null,
            appGlobals: {},
            resources: initializationProps.resources,
            themes: initializationProps.themes,
            defaultTone: initializationProps.defaultTone,
            defaultTheme: initializationProps.defaultTheme,
          },
          components: initializationProps.components.map((c) => preprocessCode(c)),
          app: preprocessCode(initializationProps.app),
          api: initializationProps.api,
        }),
      );

      dispatch(
        optionsInitialized({
          orientation: initializationProps.horizontal ? "horizontal" : "vertical",
          swapped: initializationProps.swapped,
          activeTheme: initializationProps.defaultTheme,
          activeTone: initializationProps.defaultTone,
          content: "app",
          previewMode: initializationProps.previewOnly,
          allowStandalone: initializationProps.allowStandalone,
          id: 0,
          language: "xmlui",
          fixedTheme: initializationProps.fixedTheme,
        }),
      );
    }
  }, [initializationProps]);

  const [playgroundState, dispatch] = useReducer(playgroundReducer, INITIAL_PLAYGROUND_STATE);

  const playgroundContextValue = useMemo(() => {
    return {
      playgroundId: id,
      status: playgroundState.status,
      options: playgroundState.options,
      text: playgroundState.text,
      originalAppDescription: playgroundState.originalAppDescription,
      appDescription: playgroundState.appDescription,
      dispatch,
      error: playgroundState.error,
    };
  }, [
    id,
    playgroundState.status,
    playgroundState.options,
    playgroundState.text,
    playgroundState.originalAppDescription,
    playgroundState.appDescription,
    playgroundState.error,
  ]);

  return (
    <PlaygroundContext.Provider value={playgroundContextValue}>
      <ErrorBoundary>
        <div className={styles.playground}>
          <Header />
          <PlaygroundContent height={height} initialPrimarySize={initialEditorHeight} />
        </div>
      </ErrorBoundary>
    </PlaygroundContext.Provider>
  );
};
