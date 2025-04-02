import React, { useEffect, useId, useMemo, useReducer } from "react";
import "../../../xmlui/src/index.scss";
import {
  appDescriptionInitialized,
  optionsInitialized,
  PlaygroundContext,
  playgroundReducer,
  toneChanged,
} from "../state/store";
import type { ThemeDefinition } from "../../../xmlui/src/abstractions/ThemingDefs";
import {INITIAL_PLAYGROUND_STATE, preprocessCode} from "../utils/helpers";
import { PlaygroundContent } from "../components/PlaygroundContent";
import { useTheme } from "nextra-theme-docs";
import styles from "./Playground.module.scss";
import { Header } from "../components/Header";
import type { ApiInterceptorDefinition } from "../../../xmlui/src/components-core/interception/abstractions";
import { ErrorBoundary } from "../../../xmlui/src/components-core/rendering/ErrorBoundary";

type PlaygroundProps = {
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
  const { theme, systemTheme } = useTheme();
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

  useEffect(() => {
    const nextraTone = theme === "system" ? systemTheme : theme;
    if (!defaultTone) {
      dispatch(toneChanged(nextraTone!));
    }
  }, [theme, systemTheme, defaultTone]);

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
