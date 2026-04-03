import React, { useCallback, useEffect, useRef, useState } from "react";
import classnames from "classnames";

import styles from "./Inspector.module.scss";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { normalizePath } from "../../components-core/utils/misc";
import SearchCodeIcon from "../Icon/svg/l-search-code.svg?react";

const CDN_BASE = "https://cdn.jsdelivr.net/gh/xmlui-org/trace-tools@main/";
const CDN_FILES = {
  diff: "xs-diff.html",
  trace: "xs-trace.js",
  parser: "xmlui-parser.es.js",
} as const;

type Props = {
  src?: string;
  tooltip?: string;
  dialogTitle?: string;
  dialogWidth?: string;
  dialogHeight?: string;
  classes?: Record<string, string>;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultProps = {
  src: "xmlui/xs-diff.html",
  tooltip: "Inspector",
  dialogTitle: "XMLUI Inspector",
  dialogWidth: "95vw",
  dialogHeight: "95vh",
};

async function fetchWithFallback(localPath: string, cdnFile: string): Promise<{ text: string; usedCdn: boolean } | null> {
  try {
    const resp = await fetch(normalizePath(localPath));
    if (resp.ok) return { text: await resp.text(), usedCdn: false };
  } catch {
    // local fetch failed, fall through to CDN
  }
  try {
    const resp = await fetch(CDN_BASE + cdnFile);
    if (resp.ok) return { text: await resp.text(), usedCdn: true };
  } catch {
    // CDN fetch also failed
  }
  return null;
}

function injectTraceScript(src: string) {
  if (document.querySelector('script[data-xmlui-trace]')) return;
  const script = document.createElement("script");
  script.src = src;
  script.setAttribute("data-xmlui-trace", "true");
  script.onerror = () => {
    script.remove();
    const cdnScript = document.createElement("script");
    cdnScript.src = CDN_BASE + CDN_FILES.trace;
    cdnScript.setAttribute("data-xmlui-trace", "true");
    document.head.appendChild(cdnScript);
  };
  document.head.appendChild(script);
}

async function resolveParserUrl(basePath: string): Promise<string> {
  const localUrl = new URL(basePath + CDN_FILES.parser, window.location.href).href;
  try {
    const resp = await fetch(localUrl, { method: "HEAD" });
    if (resp.ok) return localUrl;
  } catch {
    // local not available
  }
  return CDN_BASE + CDN_FILES.parser;
}

function rewriteParserImport(html: string, parserUrl: string): string {
  return html.replace(
    /from\s+["']\.\/xmlui-parser\.es\.js["']/,
    `from "${parserUrl}"`
  );
}

export function Inspector({
  src = defaultProps.src,
  tooltip = defaultProps.tooltip,
  dialogTitle = defaultProps.dialogTitle,
  dialogWidth = defaultProps.dialogWidth,
  dialogHeight = defaultProps.dialogHeight,
  classes,
  registerComponentApi,
}: Props) {
  const [open, setOpen] = useState(false);
  const [srcdoc, setSrcdoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Derive basePath from src (directory containing xs-diff.html)
  const basePath = src.substring(0, src.lastIndexOf("/") + 1);

  // Inject xs-trace.js on mount
  useEffect(() => {
    injectTraceScript(normalizePath(basePath + CDN_FILES.trace));
  }, [basePath]);

  useEffect(() => {
    registerComponentApi?.({
      open: () => setOpen(true),
      close: () => setOpen(false),
    });
  }, [registerComponentApi]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Fetch xs-diff.html (local with CDN fallback) when dialog opens
  const loadInspector = useCallback(async () => {
    if (srcdoc) return; // already loaded
    setLoading(true);
    const result = await fetchWithFallback(src, CDN_FILES.diff);
    if (result) {
      const parserUrl = await resolveParserUrl(basePath);
      setSrcdoc(rewriteParserImport(result.text, parserUrl));
    }
    setLoading(false);
  }, [src, basePath, srcdoc]);

  useEffect(() => {
    if (open) loadInspector();
  }, [open, loadInspector]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) setOpen(false);
  };

  return (
    <>
      <span
        className={classnames(styles.iconButton, classes?.[COMPONENT_PART_KEY])}
        onClick={() => setOpen(true)}
        title={tooltip}
        role="button"
        aria-label="Inspector"
        data-testid="Inspector"
      >
        <SearchCodeIcon className={styles.icon} />
      </span>
      {open && (
        <div
          ref={overlayRef}
          className={styles.overlay}
          onClick={handleOverlayClick}
          data-testid="InspectorDialog"
        >
          <div
            className={styles.dialog}
            style={{ minWidth: dialogWidth, minHeight: dialogHeight }}
          >
            <div className={styles.header}>
              <span className={styles.title}>{dialogTitle}</span>
              <button className={styles.closeButton} onClick={() => setOpen(false)}>
                &times;
              </button>
            </div>
            {loading ? (
              <div className={styles.iframe} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                Loading Inspector…
              </div>
            ) : srcdoc ? (
              <iframe
                srcDoc={srcdoc}
                className={styles.iframe}
                data-testid="InspectorFrame"
              />
            ) : (
              <div className={styles.iframe} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                Failed to load Inspector
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
