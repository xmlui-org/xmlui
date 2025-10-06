import { useEffect, useId, useMemo, useReducer, useRef, useState } from "react";
import {
  appDescriptionInitialized,
  contentChanged,
  optionsInitialized,
  PlaygroundContext,
  playgroundReducer,
} from "../state/store";
import { decompressData, INITIAL_PLAYGROUND_STATE } from "../utils/helpers";
import { ToastProvider } from "../providers/ToastProvider";
import styles from "./StandalonePlaygroundNative.module.scss";
import { useToast } from "../hooks/useToast";
import { ErrorBoundary, useThemes } from "xmlui";
import { Header } from "./Header";
import { PlaygroundContent } from "./PlaygroundContent";
import { Theme } from "../themes/theme";

export const StandalonePlayground = () => {
  const { showToast } = useToast();
  const id = useId();
  const [loading, setLoading] = useState(true);
  const { setActiveThemeTone } = useThemes();
  const [playgroundState, dispatch] = useReducer(playgroundReducer, INITIAL_PLAYGROUND_STATE);
  const initialized = useRef(false);

  const queryParams = useMemo(() => {
    if (typeof window !== "undefined") {
      return Object.fromEntries(new URLSearchParams("?app=" + window.location.hash.split("#")[2]));
    }
    return {};
  }, []);

  useEffect(() => {
    const getApp = async () => {
      try {
        const data = JSON.parse(await decompressData(queryParams.app as string));
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
      setLoading(false);
      initialized.current = true;
    };

    if (initialized.current) {
      return;
    } else {
      if (queryParams.app && queryParams.app !== "undefined") {
        getApp();
      } else {
        dispatch(
          appDescriptionInitialized({
            config: {
              name: "Hello World",
              description: "",
              appGlobals: {},
              resources: {},
              themes: [Theme],
            },
            components: [],
            app: "<App>Hello World!</App>",
          }),
        );
        dispatch(
          optionsInitialized({
            activeTheme: "theme",
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
        setLoading(false);
        initialized.current = true;
      }
    }
  }, [queryParams.app, showToast, setActiveThemeTone, playgroundState.options]);

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
      error: playgroundState.error,
    };
  }, [
    playgroundState.editorStatus,
    playgroundState.status,
    playgroundState.options,
    playgroundState.text,
    playgroundState.originalAppDescription,
    playgroundState.appDescription,
    id,
    playgroundState.error,
  ]);

  return (
    <ToastProvider>
      <PlaygroundContext.Provider value={playgroundContextValue}>
        <ErrorBoundary>
          {loading && <AnimatedLogo />}
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

function AnimatedLogo() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingText}>Loading XMLUI App...</div>
      <div className={styles.logoWrapper}>
        <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
          {/* Unchanged inner paths */}
          <path
            d="M9.04674 19.3954C8.2739 19.3954 7.60226 19.2265 7.03199 18.8887C6.47443 18.5384 6.0435 18.0505 5.73938 17.425C5.43526 16.7869 5.2832 16.0362 5.2832 15.173V9.89961C5.2832 9.7745 5.32771 9.66815 5.41637 9.58059C5.50502 9.493 5.61275 9.44922 5.73938 9.44922H7.41222C7.55157 9.44922 7.6593 9.493 7.73524 9.58059C7.8239 9.66815 7.86841 9.7745 7.86841 9.89961V15.0604C7.86841 16.6117 8.55895 17.3874 9.94021 17.3874C10.5991 17.3874 11.1187 17.181 11.4988 16.7681C11.8917 16.3553 12.0881 15.786 12.0881 15.0604V9.89961C12.0881 9.7745 12.1325 9.66815 12.2211 9.58059C12.3098 9.493 12.4175 9.44922 12.5443 9.44922H14.217C14.3436 9.44922 14.4513 9.493 14.54 9.58059C14.6288 9.66815 14.6732 9.7745 14.6732 9.89961V18.7574C14.6732 18.8825 14.6288 18.9888 14.54 19.0764C14.4513 19.164 14.3436 19.2078 14.217 19.2078H12.6773C12.538 19.2078 12.4239 19.164 12.3352 19.0764C12.2591 18.9888 12.2211 18.8825 12.2211 18.7574V17.988C11.879 18.4258 11.4545 18.7699 10.9476 19.0201C10.4407 19.2703 9.80704 19.3954 9.04674 19.3954Z"
            fill="#3367CC"
          />
          <path
            d="M17.6397 19.2104C17.5129 19.2104 17.4052 19.1666 17.3165 19.079C17.2279 18.9914 17.1835 18.8851 17.1835 18.76V9.90221C17.1835 9.7771 17.2279 9.67075 17.3165 9.58319C17.4052 9.4956 17.5129 9.45182 17.6397 9.45182H19.2174C19.3567 9.45182 19.4644 9.4956 19.5404 9.58319C19.6292 9.67075 19.6736 9.7771 19.6736 9.90221V18.76C19.6736 18.8851 19.6292 18.9914 19.5404 19.079C19.4644 19.1666 19.3567 19.2104 19.2174 19.2104H17.6397ZM17.5636 7.8379C17.4243 7.8379 17.3102 7.80038 17.2215 7.72531C17.1454 7.63773 17.1074 7.52514 17.1074 7.38751V6.03633C17.1074 5.91122 17.1454 5.80487 17.2215 5.71731C17.3102 5.62972 17.4243 5.58594 17.5636 5.58594H19.2933C19.4327 5.58594 19.5467 5.62972 19.6354 5.71731C19.7242 5.80487 19.7686 5.91122 19.7686 6.03633V7.38751C19.7686 7.52514 19.7242 7.63773 19.6354 7.72531C19.5467 7.80038 19.4327 7.8379 19.2933 7.8379H17.5636Z"
            fill="#3367CC"
          />

          {/* ✨ MODIFIED outer path for animation */}
          <path
            className={styles.animatedLogoPath}
            d="M23.0215 2.81748H2.53486V23.044H23.0215V2.81748Z"
            fill="none"
            stroke="#3367CC"
            strokeWidth="0.75"
          />
        </svg>
      </div>
    </div>
  );
}
