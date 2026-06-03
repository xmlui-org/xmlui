import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

import { AppError } from "../../components-core/errors/app-error";

// =====================================================================================================================
// React Fallback component implementation
//
// Plan #07 Phase 4 Step 4.1.
// Renders the happy-path children by default. When a descendant loader
// reports an error through the FallbackContext (Loader.tsx calls
// `reportError`), Fallback switches to the error template, passing the
// `AppError` as the `$error` context variable.
// Additionally acts as a React error boundary for render-time throws.

// ---------------------------------------------------------------------------
// FallbackContext — descendants report / clear errors
// ---------------------------------------------------------------------------

export interface FallbackContextValue {
  reportError: (id: string | symbol, error: AppError) => void;
  clearError: (id: string | symbol) => void;
}

export const FallbackContext = createContext<FallbackContextValue | undefined>(undefined);

export function useFallback(): FallbackContextValue | undefined {
  return useContext(FallbackContext);
}

// ---------------------------------------------------------------------------
// FallbackErrorBoundary — catch render-time throws
// ---------------------------------------------------------------------------

import { Component } from "react";

interface BoundaryProps {
  onCatch: (error: unknown) => void;
  children?: ReactNode;
  hasError: boolean;
}

class FallbackErrorBoundary extends Component<BoundaryProps> {
  componentDidCatch(error: unknown): void {
    this.props.onCatch(error);
  }
  render() {
    // When parent has switched to error slot, render nothing here.
    if (this.props.hasError) return null;
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

import { defaultProps } from "./Fallback.defaults";

type FallbackProps = {
  children?: ReactNode;
  errorRender?: ($error: AppError) => ReactNode;
  loadingRender?: () => ReactNode;
  isLoading?: boolean;
};

export function Fallback({ children, errorRender, loadingRender, isLoading }: FallbackProps) {
  // Map of descendant-loader uid → latest reported AppError.
  // useRef + version state keeps the Map identity stable while still
  // forcing re-renders when its contents change.
  const errorsRef = useRef<Map<string | symbol, AppError>>(new Map());
  const [, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  // Render-time throws captured by the inner boundary.
  const [boundaryError, setBoundaryError] = useState<AppError | undefined>(undefined);

  const ctx = useMemo<FallbackContextValue>(
    () => ({
      reportError: (id, error) => {
        errorsRef.current.set(id, error);
        bump();
      },
      clearError: (id) => {
        if (errorsRef.current.delete(id)) bump();
      },
    }),
    [bump],
  );

  // Pick the first reported error (deterministic for tests).
  const reportedError: AppError | undefined =
    boundaryError ?? errorsRef.current.values().next().value;

  const onCatch = useCallback((raw: unknown) => {
    setBoundaryError(AppError.from(raw));
  }, []);

  if (reportedError && errorRender) {
    return <FallbackContext.Provider value={ctx}>{errorRender(reportedError)}</FallbackContext.Provider>;
  }
  if (isLoading && loadingRender) {
    return <FallbackContext.Provider value={ctx}>{loadingRender()}</FallbackContext.Provider>;
  }
  return (
    <FallbackContext.Provider value={ctx}>
      <FallbackErrorBoundary onCatch={onCatch} hasError={Boolean(reportedError)}>
        {children}
      </FallbackErrorBoundary>
    </FallbackContext.Provider>
  );
}
