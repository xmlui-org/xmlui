import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children?: ReactNode;
  location?: string;
  node?: unknown;
};

type ErrorBoundaryState = {
  error: Error | undefined;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: undefined,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[xmlui]", this.props.location ?? "render", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return null;
    }
    return this.props.children;
  }
}
