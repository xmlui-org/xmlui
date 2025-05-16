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
import { ErrorBoundary, Spinner } from "xmlui";
import { Header } from "./Header";
import { PlaygroundContent } from "./PlaygroundContent";

export const StandalonePlayground = () => {
  const { showToast } = useToast();
  const id = useId();
  const [loading, setLoading] = useState(true);

  const queryParams = useMemo(() => {
    if (typeof window !== "undefined") {
      return Object.fromEntries(new URLSearchParams("?app=" + window.location.hash.split("#")[2]));
    }
    return {};
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollbarGutter = "auto";

    return () => {
      document.documentElement.style.scrollbarGutter = "";
    };
  }, []);

  useEffect(() => {
    const getApp = async () => {
      try {
        const data = JSON.parse(await decompressData(queryParams.app as string));
        setLoading(false);
        dispatch(appDescriptionInitialized(data.standalone));
        dispatch(
          optionsInitialized({
            ...playgroundState.options,
            ...data.options,
            orientation: "horizontal",
          }),
        );
        dispatch(contentChanged(data.options.content));
      } catch (e) {
        showToast({
          type: "error",
          title: "Error",
          description: "The app could not be loaded",
        });
      }
    };
    if (queryParams.app) {
      getApp();
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
