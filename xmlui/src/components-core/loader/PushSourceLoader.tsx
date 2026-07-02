import { useCallback, useEffect, useRef } from "react";

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
import {
  getCurrentTrace,
  pushXsLog,
  safeStringify,
  xsConsoleLog,
} from "../inspector/inspectorUtils";

// --- PushSourceLoader: wires an app-provided `subscribe` callback into the
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
// PushSource is the push analogue of DataSource: DataSource pulls (fetch /
// poll), PushSource receives pushed values. Unlike `DataLoader` / `ApiLoader`,
// this loader does not own any fetch or polling logic. It does not depend on
// React Query. Errors raised inside subscribe are routed through
// `loaderError`; the loader stays active and may continue receiving emits
// afterward.
//
// Inspector instrumentation mirrors DataLoader's xsLog plumbing:
//  - pushsource:mount        — component mounted (with initial value snapshot)
//  - pushsource:subscribe    — subscribe() called
//  - pushsource:emit         — producer pushed a value (payload included)
//  - pushsource:invalid      — subscribe prop is not a function
//  - pushsource:error        — subscribe() threw on registration
//  - pushsource:unsubscribe  — cleanup ran on unmount

type PushSourceLoaderProps = {
  loader: PushSourceLoaderDef;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderIsRefetchingChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  state: ContainerState;
};

function PushSourceLoader({
  loader,
  loaderInProgressChanged,
  loaderLoaded,
  loaderError,
  state,
}: PushSourceLoaderProps) {
  const appContext = useAppContext();
  const xsVerbose = appContext.xmluiConfig?.xsVerbose === true;
  const xsLogMax = Number(appContext.xmluiConfig?.xsVerboseLogMax ?? 200);

  const instanceIdRef = useRef<string>(
    `push-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`,
  );
  const emitSeqRef = useRef<number>(0);

  // Inspector verbose logging — no-op when xsVerbose is off. Emits a
  // structured entry to the xs log ring buffer with full PushSource
  // context. Mirrors the shape DataLoader uses so the Inspector UI's
  // existing filters/columns light up the same way.
  const xsLog = useCallback(
    (kind: string, detail?: Record<string, any>) => {
      if (!xsVerbose) return;
      xsConsoleLog(kind, detail);
      pushXsLog(
        {
          ts: Date.now(),
          perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
          traceId: getCurrentTrace(),
          instanceId: instanceIdRef.current,
          // Reuse dataSourceId field name so existing Inspector columns
          // surface the id for both DataSource and PushSource rows.
          dataSourceId: (loader?.props as any)?.id,
          ownerUid: loader?.uid,
          ownerFileId: loader?.debug?.source?.fileId,
          ownerSource: loader?.debug?.source
            ? { start: loader.debug.source.start, end: loader.debug.source.end }
            : undefined,
          text: safeStringify([kind, detail]),
          kind,
          eventName: detail?.eventName,
          uid: detail?.uid ? String(detail.uid) : undefined,
          componentType: "PushSource",
        },
        xsLogMax,
      );
    },
    [xsVerbose, xsLogMax, loader],
  );

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
  const xsLogRef = useRef(xsLog);
  xsLogRef.current = xsLog;

  // --- Seed the initial value once before subscribe runs. Producers
  // that need a synchronous initial value can either rely on `initial`
  // or call `emit(seed)` synchronously inside their subscribe body.
  useEffect(() => {
    xsLogRef.current("pushsource:mount", {
      hasInitial: initialValue !== undefined,
      initialValuePreview: initialValue !== undefined ? safeStringify(initialValue) : undefined,
    });
    if (initialValue !== undefined) {
      loaderLoadedRef.current(initialValue);
    }
    // Mark not-in-progress: PushSource is always "ready" once mounted.
    loaderInProgressChangedRef.current(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Wire the subscription. Re-runs only when subscribeFn identity
  // changes (which for the common `window.subscribeFoo` case is
  // effectively never).
  useEffect(() => {
    if (typeof subscribeFn !== "function") {
      if (subscribeFn !== undefined && subscribeFn !== null) {
        xsLogRef.current("pushsource:invalid", {
          subscribeFnType: typeof subscribeFn,
        });
        console.warn(
          "[XMLUI] PushSource: `subscribe` prop must be a function; got " +
            typeof subscribeFn,
        );
      }
      return;
    }

    xsLogRef.current("pushsource:subscribe", {});

    const emit = (value: any) => {
      const seq = (emitSeqRef.current += 1);
      xsLogRef.current("pushsource:emit", {
        seq,
        valuePreview: safeStringify(value),
      });
      loaderLoadedRef.current(value);
    };

    let unsubscribe: unknown;
    try {
      unsubscribe = subscribeFn(emit);
    } catch (err) {
      xsLogRef.current("pushsource:error", {
        message: String((err as Error)?.message ?? err),
      });
      loaderErrorRef.current(AppError.from(err));
    }

    return () => {
      xsLogRef.current("pushsource:unsubscribe", {
        hadUnsubscribeFn: typeof unsubscribe === "function",
      });
      if (typeof unsubscribe === "function") {
        try {
          (unsubscribe as () => void)();
        } catch (err) {
          // Unsubscribe errors are reported but do not propagate; the
          // component is being torn down regardless.
          console.error("[XMLUI] PushSource: unsubscribe threw:", err);
        }
      }
    };
  }, [subscribeFn]);

  return null;
}

// ---------------------------------------------------------------------------
// Renderer registration

const PushSourceLoaderMd = createMetadata({
  status: "experimental",
  description:
    "Bridges an app-defined push source into XMLUI's reactive model — the " +
    "push analogue of DataSource. The `subscribe` prop is a function that " +
    "receives an `emit` callback; every emit becomes an observable value " +
    "change. Use for host-bridge values (postMessage, Tauri events, " +
    "WebSocket pushes, polling caches, DOM observers) that cannot be " +
    "expressed as a DataSource.",
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

type PushSourceLoaderDef = ComponentDef<typeof PushSourceLoaderMd>;

export const pushSourceLoaderRenderer = createLoaderRenderer(
  "PushSource",
  ({
    loader,
    state,
    loaderInProgressChanged,
    loaderIsRefetchingChanged,
    loaderLoaded,
    loaderError,
  }) => {
    return (
      <PushSourceLoader
        loader={loader}
        state={state}
        loaderInProgressChanged={loaderInProgressChanged}
        loaderIsRefetchingChanged={loaderIsRefetchingChanged}
        loaderLoaded={loaderLoaded}
        loaderError={loaderError}
      />
    );
  },
  PushSourceLoaderMd,
);
