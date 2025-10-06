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

  useEffect(() => {
    if (app) {
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
          language: "xmlui",
          fixedTheme,
        }),
      );
    }

    //TODO illesg, review (dep array?)!!!
  }, []);

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
    };
  }, [
    id,
    playgroundState.status,
    playgroundState.options,
    playgroundState.text,
    playgroundState.originalAppDescription,
    playgroundState.appDescription,
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
