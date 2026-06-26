import React, {
  type CSSProperties,
  type ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classnames from "classnames";

import styles from "./XmluiBuilderFrame.module.scss";

export type XmluiBuilderPanel = "chat" | "preview" | "code" | "timeline";

export type XmluiBuilderFrameProps = {
  layout?: "auto" | "split" | "tabs" | "stack";
  chatPlacement?: "start" | "end" | "hidden";
  workspaceMode?: "auto" | "preview" | "code" | "split" | "tabs";
  activePanel?: XmluiBuilderPanel;
  resizable?: boolean;
  compactBreakpoint?: string;
  chatTemplate?: ReactNode;
  composerTemplate?: ReactNode;
  toolbarTemplate?: ReactNode;
  statusTemplate?: ReactNode;
  previewTemplate?: ReactNode;
  codeTemplate?: ReactNode;
  timelineTemplate?: ReactNode;
  auxiliaryTemplate?: ReactNode;
  children?: ReactNode;
  className?: string;
  classes?: Record<string, string>;
  style?: CSSProperties;
  onPanelChange?: (value: { panel: XmluiBuilderPanel }) => void;
};

export const defaultProps = {
  layout: "auto" as const,
  chatPlacement: "start" as const,
  workspaceMode: "auto" as const,
  activePanel: "preview" as XmluiBuilderPanel,
  resizable: true,
  compactBreakpoint: "960px",
};

function normalizePanel(panel: XmluiBuilderPanel | undefined, available: XmluiBuilderPanel[]) {
  if (panel && available.includes(panel)) {
    return panel;
  }
  return available[0];
}

function parseLengthToPixels(value?: string) {
  if (!value) return 960;
  const trimmed = value.trim();
  if (!trimmed) return 960;

  const direct = Number.parseFloat(trimmed);
  if (Number.isFinite(direct) && /^[\d.]+$/.test(trimmed)) {
    return direct;
  }

  const rootFontSize =
    typeof window !== "undefined"
      ? Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16
      : 16;

  if (trimmed.endsWith("px")) {
    return Number.parseFloat(trimmed);
  }
  if (trimmed.endsWith("rem") || trimmed.endsWith("em")) {
    return Number.parseFloat(trimmed) * rootFontSize;
  }

  return 960;
}

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const measure = () => {
      setWidth(element.getBoundingClientRect().width);
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return width;
}

export const XmluiBuilderFrameNative = memo(
  forwardRef<HTMLDivElement, XmluiBuilderFrameProps>(function XmluiBuilderFrameNative(
    {
      layout = defaultProps.layout,
      chatPlacement = defaultProps.chatPlacement,
      workspaceMode = defaultProps.workspaceMode,
      activePanel,
      resizable = defaultProps.resizable,
      compactBreakpoint = defaultProps.compactBreakpoint,
      chatTemplate,
      composerTemplate,
      toolbarTemplate,
      statusTemplate,
      previewTemplate,
      codeTemplate,
      timelineTemplate,
      auxiliaryTemplate,
      children,
      className,
      classes,
      style,
      onPanelChange,
    },
    forwardedRef,
  ) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const splitRef = useRef<HTMLDivElement | null>(null);
    const [splitRatio, setSplitRatio] = useState(0.38);
    const [internalPanel, setInternalPanel] = useState<XmluiBuilderPanel>(
      activePanel ?? defaultProps.activePanel,
    );
    const containerWidth = useContainerWidth(rootRef);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
      if (activePanel) {
        setInternalPanel(activePanel);
      }
    }, [activePanel]);

    const availablePanels = useMemo(() => {
      const panels: XmluiBuilderPanel[] = [];
      if ((chatTemplate || composerTemplate) && chatPlacement !== "hidden") panels.push("chat");
      if (previewTemplate) panels.push("preview");
      if (codeTemplate) panels.push("code");
      if (timelineTemplate) panels.push("timeline");
      return panels;
    }, [chatTemplate, chatPlacement, composerTemplate, previewTemplate, codeTemplate, timelineTemplate]);

    const compact = containerWidth > 0 && containerWidth <= parseLengthToPixels(compactBreakpoint);
    const hasChat = availablePanels.includes("chat");
    const hasWorkspace = availablePanels.some((panel) => panel !== "chat");
    const chatVisible = hasChat && chatPlacement !== "hidden";
    const enoughForSplit = chatVisible && hasWorkspace;

    const resolvedLayout = useMemo(() => {
      if (layout === "tabs") return "tabs" as const;
      if (layout === "stack") return "stack" as const;
      if (layout === "split") return enoughForSplit ? ("split" as const) : ("stack" as const);
      if (compact && availablePanels.length > 1) return "tabs" as const;
      if (enoughForSplit) return "split" as const;
      return "stack" as const;
    }, [layout, enoughForSplit, compact, availablePanels.length]);

    const workspacePanels = useMemo(
      () => availablePanels.filter((panel) => panel !== "chat"),
      [availablePanels],
    );

    const workspaceSelection = normalizePanel(
      internalPanel && internalPanel !== "chat" ? internalPanel : undefined,
      workspacePanels,
    );
    const tabSelection = normalizePanel(internalPanel, availablePanels);

    useEffect(() => {
      if (activePanel) return;
      if (!availablePanels.length) return;
      if (availablePanels.includes(internalPanel)) return;
      setInternalPanel(availablePanels[0]);
    }, [activePanel, availablePanels, internalPanel]);

    const setPanel = useCallback(
      (panel: XmluiBuilderPanel) => {
        setInternalPanel(panel);
        onPanelChange?.({ panel });
      },
      [onPanelChange],
    );

    const assignRootRef = useCallback(
      (element: HTMLDivElement | null) => {
        rootRef.current = element;
        if (typeof forwardedRef === "function") {
          forwardedRef(element);
        } else if (forwardedRef && "current" in forwardedRef) {
          forwardedRef.current = element;
        }
      },
      [forwardedRef],
    );

    useEffect(() => {
      if (!isDragging) return undefined;

      const handlePointerMove = (event: PointerEvent) => {
        const element = splitRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0) return;
        const nextRatio = (event.clientX - rect.left) / rect.width;
        setSplitRatio(Math.min(0.68, Math.max(0.22, nextRatio)));
      };

      const handlePointerUp = () => {
        setIsDragging(false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };
    }, [isDragging]);

    const chatSection = hasChat ? (
      <section
        className={classnames(styles.chatPane, classes?.chat, {
          [styles.chatPaneHidden]: chatPlacement === "hidden",
        })}
        data-region="chat"
      >
        <div className={styles.panelScroll}>
          {chatTemplate}
          {composerTemplate}
        </div>
      </section>
    ) : null;

    const previewNode = previewTemplate;
    const codeNode = codeTemplate;
    const timelineNode = timelineTemplate;
    const auxiliaryNode = auxiliaryTemplate ?? children;

    const workspaceTabs = workspacePanels.length > 1;

    const renderWorkspaceContent = () => {
      if (!hasWorkspace && !auxiliaryNode) return null;

      const selectedWorkspace = workspaceSelection ?? workspacePanels[0] ?? "preview";
      const singlePanel =
        workspaceMode === "preview"
          ? previewNode
          : workspaceMode === "code"
            ? codeNode
            : workspaceMode === "split"
              ? previewNode ?? codeNode ?? timelineNode
              : selectedWorkspace === "code"
                ? codeNode
                : selectedWorkspace === "timeline"
                  ? timelineNode
                  : previewNode ?? codeNode ?? timelineNode;

      return (
        <section className={classnames(styles.workspacePane, classes?.workspace)} data-region="workspace">
          {resolvedLayout !== "tabs" && (workspaceMode === "tabs" || (workspaceMode === "auto" && compact && workspaceTabs)) ? (
            <div className={classnames(styles.workspaceTabs, classes?.tabs)} role="tablist" aria-label="Workspace panels">
              {workspacePanels.includes("preview") && (
                <button
                  type="button"
                  className={classnames(styles.tabButton, classes?.tab, {
                    [styles.tabButtonActive]: selectedWorkspace === "preview",
                  })}
                  aria-selected={selectedWorkspace === "preview"}
                  role="tab"
                  onClick={() => setPanel("preview")}
                >
                  Preview
                </button>
              )}
              {workspacePanels.includes("code") && (
                <button
                  type="button"
                  className={classnames(styles.tabButton, classes?.tab, {
                    [styles.tabButtonActive]: selectedWorkspace === "code",
                  })}
                  aria-selected={selectedWorkspace === "code"}
                  role="tab"
                  onClick={() => setPanel("code")}
                >
                  Code
                </button>
              )}
              {workspacePanels.includes("timeline") && (
                <button
                  type="button"
                  className={classnames(styles.tabButton, classes?.tab, {
                    [styles.tabButtonActive]: selectedWorkspace === "timeline",
                  })}
                  aria-selected={selectedWorkspace === "timeline"}
                  role="tab"
                  onClick={() => setPanel("timeline")}
                >
                  Timeline
                </button>
              )}
            </div>
          ) : null}

          <div className={styles.workspaceViewport}>
            {workspaceMode === "split" && previewNode && codeNode ? (
              <div className={styles.workspaceSplit}>
                <div className={classnames(styles.panel, classes?.panel)} data-region="preview">
                  <div className={styles.panelScroll}>{previewNode}</div>
                </div>
                <div className={classnames(styles.panel, classes?.panel)} data-region="code">
                  <div className={styles.panelScroll}>{codeNode}</div>
                </div>
              </div>
            ) : (
              <div className={classnames(styles.panel, classes?.panel)} data-region={selectedWorkspace}>
                <div className={styles.panelScroll}>{singlePanel}</div>
              </div>
            )}

            {timelineNode && workspaceMode !== "tabs" && selectedWorkspace !== "timeline" ? (
              <div className={classnames(styles.panel, styles.timelinePanel, classes?.panel)} data-region="timeline">
                <div className={styles.panelScroll}>{timelineNode}</div>
              </div>
            ) : null}

            {auxiliaryNode ? (
              <div className={classnames(styles.auxiliaryPanel, classes?.auxiliary)} data-region="auxiliary">
                <div className={styles.panelScroll}>{auxiliaryNode}</div>
              </div>
            ) : null}
          </div>
        </section>
      );
    };

    const renderTopLevelTabs = () => {
      if (resolvedLayout !== "tabs" || availablePanels.length <= 1) return null;

      return (
        <div className={classnames(styles.topTabs, classes?.tabs)} role="tablist" aria-label="Builder panels">
          {availablePanels.map((panel) => (
            <button
              key={panel}
              type="button"
              className={classnames(styles.tabButton, classes?.tab, {
                [styles.tabButtonActive]: tabSelection === panel,
              })}
              aria-selected={tabSelection === panel}
              role="tab"
              onClick={() => setPanel(panel)}
            >
              {panel === "chat" ? "Chat" : panel === "preview" ? "Preview" : panel === "code" ? "Code" : "Timeline"}
            </button>
          ))}
        </div>
      );
    };

    const renderStackLayout = () => (
      <div className={classnames(styles.stackLayout, classes?.shell)}>
        {chatPlacement === "end" ? null : chatPlacement !== "hidden" ? chatSection : null}
        {renderWorkspaceContent()}
        {chatPlacement === "end" ? chatSection : null}
        {chatPlacement === "hidden" && !hasWorkspace && auxiliaryNode ? auxiliaryNode : null}
      </div>
    );

    const renderSplitLayout = () => (
      <div ref={splitRef} className={classnames(styles.splitLayout, classes?.shell)}>
        {chatPlacement !== "end" ? (
          <>
            {chatSection && (
              <section
                className={classnames(styles.chatPane, styles.chatPaneSplit, classes?.chat)}
                style={{ flexBasis: `${Math.round(splitRatio * 100)}%` }}
                data-region="chat"
              >
                <div className={styles.panelScroll}>
                  {chatTemplate}
                  {composerTemplate}
                </div>
              </section>
            )}
            {resizable && chatVisible && hasWorkspace ? (
              <div
                className={styles.splitHandle}
                aria-hidden="true"
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  event.preventDefault();
                  setIsDragging(true);
                }}
              />
            ) : null}
            {renderWorkspaceContent()}
          </>
        ) : (
          <>
            {renderWorkspaceContent()}
            {resizable && chatVisible && hasWorkspace ? (
              <div
                className={styles.splitHandle}
                aria-hidden="true"
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  event.preventDefault();
                  setIsDragging(true);
                }}
              />
            ) : null}
            {chatSection && (
              <section
                className={classnames(styles.chatPane, styles.chatPaneSplit, classes?.chat)}
                style={{ flexBasis: `${Math.round(splitRatio * 100)}%` }}
                data-region="chat"
              >
                <div className={styles.panelScroll}>
                  {chatTemplate}
                  {composerTemplate}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    );

    const renderTabsLayout = () => {
      if (availablePanels.length === 0) return null;
      const selected = tabSelection ?? availablePanels[0];

      const panelNode =
        selected === "chat"
          ? chatSection
          : selected === "preview"
            ? previewNode
            : selected === "code"
              ? codeNode
              : timelineNode;

      return (
        <div className={classnames(styles.tabsLayout, classes?.shell)}>
          <div className={classnames(styles.panel, classes?.panel)} data-region={selected}>
            <div className={styles.panelScroll}>{panelNode}</div>
          </div>
          {auxiliaryNode ? (
            <div className={classnames(styles.auxiliaryPanel, classes?.auxiliary)} data-region="auxiliary">
              <div className={styles.panelScroll}>{auxiliaryNode}</div>
            </div>
          ) : null}
        </div>
      );
    };

    const content =
      resolvedLayout === "tabs"
        ? renderTabsLayout()
        : resolvedLayout === "split"
          ? renderSplitLayout()
          : renderStackLayout();

    return (
      <div
        ref={assignRootRef}
        className={classnames(styles.root, classes?.["-component"], className)}
        style={style}
        data-layout={resolvedLayout}
        data-workspace-mode={workspaceMode}
        data-compact={compact ? "true" : "false"}
        data-chat-placement={chatPlacement}
        data-active-panel={resolvedLayout === "tabs" ? tabSelection : workspaceSelection ?? tabSelection}
      >
        <div className={classnames(styles.shell, classes?.shell)}>
          {toolbarTemplate ? (
            <div className={classnames(styles.toolbar, classes?.toolbar)} data-region="toolbar">
              {toolbarTemplate}
            </div>
          ) : null}

          {renderTopLevelTabs()}

          {content}

          {statusTemplate ? (
            <div className={classnames(styles.status, classes?.status)} data-region="status">
              {statusTemplate}
            </div>
          ) : null}
        </div>
      </div>
    );
  }),
);
