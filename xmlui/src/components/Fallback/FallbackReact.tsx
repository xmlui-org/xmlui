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

import { AppError } from "../../components-core/errors/app-error";

export interface FallbackContextValue {
  reportError: (id: string | symbol, error: AppError) => void;
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
    this.props.onCatch(AppError.from(error));
  }

  render() {
    return this.props.hasError ? null : this.props.children;
  }
}

export type FallbackProps = {
  children?: ReactNode;
  errorRender?: ($error: AppError) => ReactNode;
  loadingRender?: () => ReactNode;
  isLoading?: boolean;
};

export function Fallback({ children, errorRender, loadingRender, isLoading }: FallbackProps) {
  const errorsRef = useRef<Map<string | symbol, AppError>>(new Map());
  const [, setVersion] = useState(0);
  const [boundaryError, setBoundaryError] = useState<AppError | undefined>(undefined);
  const bump = useCallback(() => setVersion((version) => version + 1), []);

  const ctx = useMemo<FallbackContextValue>(() => ({
    reportError: (id, error) => {
      errorsRef.current.set(id, error);
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
    setBoundaryError(AppError.from(error));
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
