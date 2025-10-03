import React, { useEffect, useId, useMemo, useReducer, useState } from "react";
import {
  appDescriptionInitialized,
  contentChanged,
  optionsInitialized,
  PlaygroundContext,
  playgroundReducer,
} from "../state/store";
import { decompressData, INITIAL_PLAYGROUND_STATE } from "../utils/helpers";
import { ToastProvider } from "@radix-ui/react-toast";
import styles from "./StandalonePlaygroundNative.module.scss";
import { useToast } from "../hooks/useToast";
import { ErrorBoundary, Spinner, useThemes } from "xmlui";
import { Header } from "./Header";
import { PlaygroundContent } from "./PlaygroundContent";
import { HelloWorldTheme } from "../themes/hello-world-theme";

export const StandalonePlayground = () => {
  const { showToast } = useToast();
  const id = useId();
  const [loading, setLoading] = useState(true);
  const { setActiveThemeTone } = useThemes();

  const queryParams = useMemo(() => {
    if (typeof window !== "undefined") {
      return Object.fromEntries(new URLSearchParams("?app=" + window.location.hash.split("#")[2]));
    }
    return {};
  }, []);

  const getApp = async () => {
    try {
      const data = JSON.parse(await decompressData(queryParams.app as string));
      setLoading(false);
      console.log("cica", data.options);
      dispatch(appDescriptionInitialized(data.standalone));
      dispatch(
        optionsInitialized({
          ...playgroundState.options,
          ...data.options,
          content: "app",
          orientation: "horizontal",
        }),
      );
      setActiveThemeTone(data.options.activeTone || "light");
      dispatch(contentChanged(data.options.content));
    } catch (e) {
      showToast({
        type: "error",
        title: "Error",
        description: "The app could not be loaded",
      });
    }
  };

  useEffect(() => {
    if (queryParams.app !== "undefined") {
      getApp();
    } else {
      setLoading(false);
      dispatch(appDescriptionInitialized({
        config: {
          name: "Hello World",
          description: "",
          appGlobals: {},
          resources: {},
          themes: [HelloWorldTheme],
        },
        components: [],
        app: "<App>Hello World!</App>",
      }));
      dispatch(
        optionsInitialized({
          activeTheme: "hello-world-theme",
          activeTone: "light",
          content: "app",
          orientation: "horizontal",
          id: 0,
          allowStandalone: true,
          language: "xmlui",
          emulatedApi: undefined,
          fixedTheme: false,
        }),
      );
    }
  }, [queryParams.app]);

  const [playgroundState, dispatch] = useReducer(playgroundReducer, INITIAL_PLAYGROUND_STATE);

  const playgroundContextValue = useMemo(() => {
    return {
      editorStatus: playgroundState.editorStatus,
      status: playgroundState.status,
      options: playgroundState.options,
      text: playgroundState.text,
      originalAppDescription: playgroundState.originalAppDescription,
      appDescription: playgroundState.appDescription,
      dispatch,
      playgroundId: id,
    };
  }, [
    playgroundState.editorStatus,
    playgroundState.status,
    playgroundState.options,
    playgroundState.options.activeTone,
    playgroundState.text,
    playgroundState.originalAppDescription,
    playgroundState.appDescription,
    id,
  ]);

  return (
    <ToastProvider>
      <PlaygroundContext.Provider value={playgroundContextValue}>
        <ErrorBoundary>
          {loading && <Spinner />}
          {!loading && (
            <div className={styles.standalonePlayground}>
              {!playgroundState.options.previewMode && <Header standalone={true} />}
              <div style={{ flexGrow: 1, overflow: "auto" }}>
                <PlaygroundContent standalone={true} />
              </div>
            </div>
          )}
        </ErrorBoundary>
      </PlaygroundContext.Provider>
    </ToastProvider>
  );
};
