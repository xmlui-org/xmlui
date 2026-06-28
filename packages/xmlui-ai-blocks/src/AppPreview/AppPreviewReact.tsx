import { Component, useEffect, useMemo, useState, type ErrorInfo, type ReactNode } from "react";
import {
  StandaloneApp,
  ThemeDefinition,
  useTheme,
  useThemes,
  xmlUiMarkupToComponent,
  type StandaloneAppDescription,
  type ThemeTone,
} from "xmlui";
import styles from "./AppPreview.module.scss";

type UpdateStateFn = (newState: Record<string, unknown>, options?: { initial?: boolean }) => void;

export type AppPreviewProps = {
  code?: string;
  lastSuccessfulCode?: string;
  status?: string;
  activeTheme?: string;
  activeTone?: ThemeTone;
  updateState?: UpdateStateFn;
};

type ErrorBoundaryProps = {
  sourceKey: string;
  children: ReactNode;
};

type ErrorBoundaryState = {
  runtimeError: string | null;
};

function createCodeRevision(code: string) {
  let hash = 0;
  for (let index = 0; index < code.length; index += 1) {
    hash = (hash * 31 + code.charCodeAt(index)) >>> 0;
  }
  return `${code.length}-${hash.toString(16)}`;
}

function compileXmluiPreview(code: string, themes: unknown[], activeTheme?: string, activeTone?: ThemeTone) {
  const { errors, warnings, component } = xmlUiMarkupToComponent(code, "Main.xmlui");

  if (errors.length > 0) {
    return {
      appDef: null,
      error: errors.map((error) => `[${error.code}] ${error.message}`).join("\n"),
      warnings,
    };
  }

  if (!component) {
    return {
      appDef: null,
      error: "The XMLUI parser did not return an entry point component.",
      warnings,
    };
  }

  const appDef: StandaloneAppDescription = {
    name: "Xmlui app builder",
    version: createCodeRevision(code),
    entryPoint: component,
    themes: themes as ThemeDefinition[],
    defaultTheme: activeTheme,
    defaultTone: activeTone,
    resources: {},
    appGlobals: {
      strictDomSandbox: true,
      allowConsole: false,
      silentConsole: true,
    },
  };

  return {
    appDef,
    error: null,
    warnings,
  };
}

class PreviewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    runtimeError: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      runtimeError: error.message || "The preview failed while rendering.",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[A2XMLUI preview runtime error]", error, errorInfo);
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (previousProps.sourceKey !== this.props.sourceKey && this.state.runtimeError) {
      this.setState({ runtimeError: null });
    }
  }

  render() {
    if (this.state.runtimeError) {
      return (
        <PreviewIssue
          title="Runtime error"
          message={this.state.runtimeError}
          detail="The generated app crashed inside the preview sandbox. The builder shell is still running."
        />
      );
    }

    return this.props.children;
  }
}

function PreviewIssue({
  title,
  message,
  detail,
}: {
  title: string;
  message: string;
  detail?: string;
}) {
  return (
    <div className={styles.issue} role="alert">
      <p className={styles.issueTitle}>{title}</p>
      {detail && <p className={styles.issueDetail}>{detail}</p>}
      <pre className={styles.issueMessage}>{message}</pre>
    </div>
  );
}

export function AppPreview({
  code = "",
  lastSuccessfulCode = "",
  status,
  activeTheme,
  activeTone,
  updateState,
}: AppPreviewProps) {
  const [lastRenderableCode, setLastRenderableCode] = useState(lastSuccessfulCode || code);
  const { activeThemeId, activeThemeTone } = useTheme();
  const { themes } = useThemes();
  const effectiveTheme = activeTheme || activeThemeId;
  const effectiveTone = activeTone || activeThemeTone;
  const allThemes = useMemo(() => [...(themes || [])], [themes]);
  const preview = useMemo(
    () => compileXmluiPreview(code, allThemes, effectiveTheme, effectiveTone),
    [code, allThemes, effectiveTheme, effectiveTone],
  );
  const fallbackPreview = useMemo(
    () => compileXmluiPreview(lastRenderableCode, allThemes, effectiveTheme, effectiveTone),
    [lastRenderableCode, allThemes, effectiveTheme, effectiveTone],
  );
  const hasCurrentPreview = Boolean(preview.appDef && !preview.error);
  const canUseFallback =
    !hasCurrentPreview &&
    lastRenderableCode !== code &&
    Boolean(fallbackPreview.appDef && !fallbackPreview.error);
  const activePreview = canUseFallback ? fallbackPreview : preview;
  const activeCode = canUseFallback ? lastRenderableCode : code;
  const sourceKey = useMemo(() => createCodeRevision(activeCode), [activeCode]);
  const warnings = activePreview.warnings.map((warning) => String(warning));
  const isRepairing = status === "generating";

  useEffect(() => {
    if (hasCurrentPreview) {
      setLastRenderableCode(code);
    }
  }, [code, hasCurrentPreview]);

  useEffect(() => {
    updateState?.({
      value: {
        usingFallback: canUseFallback,
        compileError: activePreview.error,
        warnings,
      },
    });
  }, [activePreview.error, canUseFallback, updateState, warnings]);

  return (
    <div className={styles.root} aria-label="Generated app preview">
      <div className={styles.scroller}>
        {isRepairing && (activePreview.error || !activePreview.appDef) ? (
          <div className={styles.repair} role="status">
            Repairing generated app...
          </div>
        ) : activePreview.error || !activePreview.appDef ? (
          <PreviewIssue
            title="Compile error"
            message={activePreview.error ?? "Unable to compile the generated XMLUI source."}
            detail="No previously renderable XMLUI version is available for fallback yet."
          />
        ) : (
          <PreviewErrorBoundary sourceKey={sourceKey} key={sourceKey}>
            <StandaloneApp
              key={sourceKey}
              appDef={activePreview.appDef}
              decorateComponentsWithTestId
              debugEnabled={false}
            />
          </PreviewErrorBoundary>
        )}
      </div>
    </div>
  );
}
