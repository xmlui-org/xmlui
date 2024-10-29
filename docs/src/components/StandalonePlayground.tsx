import React, { useEffect, useMemo, useReducer } from "react";
import { ErrorBoundary } from "@components-core/ErrorBoundary";
import "@src/index.scss";
import { useToast } from "@/src/hooks/useToast";
import {
  appDescriptionInitialized, contentChanged,
  optionsInitialized,
  PlaygroundContext,
  playgroundReducer,
} from "@/src/state/store";
import { decompressData, INITIAL_PLAYGROUND_STATE } from "@/src/utils/helpers";
import { ToastProvider } from "@radix-ui/react-toast";
import { PlaygroundContent } from "@/src/components/PlaygroundContent";
import { Header } from "@/src/components/Header";
import styles from "./StandalonePlayground.module.scss";

export const StandalonePlayground = () => {
  const { showToast } = useToast();

  const queryParams = useMemo(() => {
    if (typeof window !== "undefined") {
      return Object.fromEntries(new URLSearchParams("?app=" + window.location.hash.split("#")[1]));
    }
    return {};
  }, []);

  useEffect(() => {
    const getApp = async () => {
      try {
        const data = JSON.parse(await decompressData(queryParams.app as string));
        dispatch(appDescriptionInitialized(data.standalone));
        dispatch(optionsInitialized({ ...playgroundState.options, ...data.options }));
        dispatch(contentChanged(data.options.content))
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
    <ToastProvider>
      <PlaygroundContext.Provider value={playgroundContextValue}>
        <ErrorBoundary>
          <div className={styles.standalonePlayground}>
            {!playgroundState.options.previewMode && <Header />}
            <div style={{ flexGrow: 1, overflow: "auto" }}>
              <PlaygroundContent standalone={true} />
            </div>
          </div>
        </ErrorBoundary>
      </PlaygroundContext.Provider>
    </ToastProvider>
  );
};
