import { useEffect, useRef } from "react";

import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
} from "../abstractions/LoaderRenderer";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../rendering/ContainerWrapper";
import { extractParam } from "../utils/extractParam";
import { createLoaderRenderer } from "../renderers";
import { useAppContext } from "../AppContext";
import { createMetadata } from "../../components/metadata-helpers";
import { AppError } from "../errors/app-error";

// --- ExternalLoader: wires an app-provided `subscribe` callback into the
// loader pipeline. The framework's role is narrow — call subscribe on
// mount with an `emit(value)` function, dispatch every emit as a loader
// "loaded" event so the value flows through the existing observability
// machinery, and call the returned unsubscribe on unmount.
//
// Subscribe contract: `(emit: (value: any) => void) => unsubscribe | void`.
// The emit closure is stable for the lifetime of the subscription.
// Producers may call it synchronously inside subscribe (to seed an
// initial value) and asynchronously thereafter.
//
// Unlike `DataLoader` / `ApiLoader`, this loader does not own any fetch
// or polling logic. It does not depend on React Query. Errors raised
// inside subscribe are routed through `loaderError`; the loader stays
// active and may continue receiving emits afterward.

type ExternalLoaderProps = {
  loader: ExternalLoaderDef;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderIsRefetchingChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  state: ContainerState;
};

function ExternalLoader({
  loader,
  loaderInProgressChanged,
  loaderLoaded,
  loaderError,
  state,
}: ExternalLoaderProps) {
  const appContext = useAppContext();

  // --- Resolve the user-supplied subscribe callback. The XMLUI markup
  // typically passes a JS function reference via a binding expression
  // (e.g. `subscribe="{window.subscribeMyState}"`); extractParam
  // resolves the expression into a usable function value.
  const subscribeFn = extractParam(state, loader.props.subscribe, appContext);
  const initialValue = extractParam(state, loader.props.initial, appContext);

  // --- Stash the latest callbacks in refs so we can rewire the
  // subscription only when the subscribe function identity changes,
  // not on every render.
  const loaderLoadedRef = useRef(loaderLoaded);
  loaderLoadedRef.current = loaderLoaded;
  const loaderErrorRef = useRef(loaderError);
  loaderErrorRef.current = loaderError;
  const loaderInProgressChangedRef = useRef(loaderInProgressChanged);
  loaderInProgressChangedRef.current = loaderInProgressChanged;

  // --- Seed the initial value once before subscribe runs. Producers
  // that need a synchronous initial value can either rely on `initial`
  // or call `emit(seed)` synchronously inside their subscribe body.
  useEffect(() => {
    if (initialValue !== undefined) {
      loaderLoadedRef.current(initialValue);
    }
    // Mark not-in-progress: External is always "ready" once mounted.
    loaderInProgressChangedRef.current(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Wire the subscription. Re-runs only when subscribeFn identity
  // changes (which for the common `window.subscribeFoo` case is
  // effectively never).
  useEffect(() => {
    if (typeof subscribeFn !== "function") {
      if (subscribeFn !== undefined && subscribeFn !== null) {
        console.warn(
          "[XMLUI] External: `subscribe` prop must be a function; got " +
            typeof subscribeFn,
        );
      }
      return;
    }

    const emit = (value: any) => {
      loaderLoadedRef.current(value);
    };

    let unsubscribe: unknown;
    try {
      unsubscribe = subscribeFn(emit);
    } catch (err) {
      loaderErrorRef.current(AppError.from(err));
    }

    return () => {
      if (typeof unsubscribe === "function") {
        try {
          (unsubscribe as () => void)();
        } catch (err) {
          // Unsubscribe errors are reported but do not propagate; the
          // component is being torn down regardless.
          console.error("[XMLUI] External: unsubscribe threw:", err);
        }
      }
    };
  }, [subscribeFn]);

  return null;
}

// ---------------------------------------------------------------------------
// Renderer registration

const ExternalLoaderMd = createMetadata({
  status: "experimental",
  description:
    "Bridges an app-defined external value source into XMLUI's reactive " +
    "model. The `subscribe` prop is a function that receives an `emit` " +
    "callback; every emit becomes an observable value change. Use for " +
    "host-bridge values (postMessage, Tauri events, WebSocket pushes, " +
    "polling caches, DOM observers) that cannot be expressed as a " +
    "DataSource.",
  props: {
    subscribe: {
      description:
        "A function with the shape `(emit: (value) => void) => unsubscribe | void`. " +
        "Called once on mount. May call `emit` synchronously to seed an initial " +
        "value and asynchronously thereafter. The returned function (if any) is " +
        "invoked on unmount.",
      valueType: "any",
      isRequired: true,
    },
    initial: {
      description:
        "Initial value to seed before the first emit. If `subscribe` calls " +
        "`emit` synchronously during registration, the synchronous emit wins.",
      valueType: "any",
    },
  },
});

type ExternalLoaderDef = ComponentDef<typeof ExternalLoaderMd>;

export const externalLoaderRenderer = createLoaderRenderer(
  "External",
  ({
    loader,
    state,
    loaderInProgressChanged,
    loaderIsRefetchingChanged,
    loaderLoaded,
    loaderError,
  }) => {
    return (
      <ExternalLoader
        loader={loader}
        state={state}
        loaderInProgressChanged={loaderInProgressChanged}
        loaderIsRefetchingChanged={loaderIsRefetchingChanged}
        loaderLoaded={loaderLoaded}
        loaderError={loaderError}
      />
    );
  },
  ExternalLoaderMd,
);
