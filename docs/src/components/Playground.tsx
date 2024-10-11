import React, { useEffect, useMemo, useReducer } from "react";
import { ErrorBoundary } from "@components-core/ErrorBoundary";
import "@src/index.scss";
import {
  appDescriptionInitialized,
  optionsInitialized,
  PlaygroundContext,
  playgroundReducer,
  toneChanged,
} from "@/src/state/store";
import { ThemeDefinition } from "@components-core/theming/abstractions";
import { INITIAL_PLAYGROUND_STATE } from "@/src/utils/helpers";
import { PlaygroundContent } from "@/src/components/PlaygroundContent";
import { useTheme } from "nextra-theme-docs";
import styles from "./Playground.module.scss";
import {Header} from "@/src/components/Header";

type PlaygroundProps = {
  name: string;
  description?: string;
  app: string;
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
  previewMode?: boolean;
  allowStandalone?: boolean;
};

export const Playground = ({
  name,
  description,
  app,
  themes = [],
  defaultTheme,
  defaultTone,
  resources = {},
  previewOnly = true,
  components = [],
  height,
  initialEditorHeight = "50%",
  swapped = false,
  horizontal = false,
  allowStandalone = true,
}: PlaygroundProps) => {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    if (app) {
      dispatch(
        appDescriptionInitialized({
          config: {
            name,
            description,
            logo: null,
            globals: {},
            resources,
            themes,
            defaultTone,
            defaultTheme,
          },
          components,
          app,
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
        }),
      );
    }
    //TODO illesg, review (dep array?)!!!
  }, []);

  useEffect(() => {
    const nextraTone = theme === "system" ? systemTheme : theme;
    dispatch(toneChanged(nextraTone!));
  }, [theme, systemTheme]);

  const [playgroundState, dispatch] = useReducer(playgroundReducer, INITIAL_PLAYGROUND_STATE);

  const playgroundContextValue = useMemo(() => {
    return {
      status: playgroundState.status,
      options: playgroundState.options,
      text: playgroundState.text,
      originalAppDescription: playgroundState.originalAppDescription,
      appDescription: playgroundState.appDescription,
      dispatch,
    };
  }, [
    playgroundState.status,
    playgroundState.options,
    playgroundState.text,
    playgroundState.appDescription,
    playgroundState.originalAppDescription,
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
