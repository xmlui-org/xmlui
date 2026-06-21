import {
  Component,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type FallbackError = {
  code?: string;
  category?: string;
  message: string;
  data?: unknown;
};

export interface FallbackContextValue {
  reportError: (id: string | symbol, error: unknown) => void;
  clearError: (id: string | symbol) => void;
}

export const FallbackContext = createContext<FallbackContextValue | undefined>(undefined);

export function useFallback(): FallbackContextValue | undefined {
  return useContext(FallbackContext);
}

type BoundaryProps = {
  onCatch: (error: unknown) => void;
  children?: ReactNode;
  hasError: boolean;
};

class FallbackErrorBoundary extends Component<BoundaryProps> {
  componentDidCatch(error: unknown): void {
    this.props.onCatch(error);
  }

  render() {
    return this.props.hasError ? null : this.props.children;
  }
}

export type FallbackProps = {
  children?: ReactNode;
  errorRender?: ($error: FallbackError) => ReactNode;
  loadingRender?: () => ReactNode;
  isLoading?: boolean;
};

export function Fallback({ children, errorRender, loadingRender, isLoading }: FallbackProps) {
  const errorsRef = useRef<Map<string | symbol, FallbackError>>(new Map());
  const [, setVersion] = useState(0);
  const [boundaryError, setBoundaryError] = useState<FallbackError | undefined>(undefined);
  const bump = useCallback(() => setVersion((version) => version + 1), []);

  const ctx = useMemo<FallbackContextValue>(() => ({
    reportError: (id, error) => {
      errorsRef.current.set(id, normalizeError(error));
      bump();
    },
    clearError: (id) => {
      if (errorsRef.current.delete(id)) {
        bump();
      }
    },
  }), [bump]);

  const reportedError = boundaryError ?? errorsRef.current.values().next().value;
  const onCatch = useCallback((error: unknown) => {
    setBoundaryError(normalizeError(error));
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

function normalizeError(error: unknown): FallbackError {
  if (error && typeof error === "object") {
    const candidate = error as Record<string, unknown>;
    return {
      code: stringValue(candidate.code),
      category: stringValue(candidate.category),
      message: stringValue(candidate.message) ?? String(error),
      data: candidate.data,
    };
  }
  return {
    message: String(error),
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
