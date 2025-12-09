import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { useAppContext } from "../../components-core/AppContext";
import type { PageMd } from "../Pages/Pages";
import { IndexerContext } from "./IndexerContext";
import { useSearchContextSetIndexing, useSearchContextUpdater } from "./SearchContext";

const HIDDEN_STYLE: CSSProperties = {
  position: "absolute",
  top: "-9999px",
  display: "none",
};

const indexerContextValue = {
  indexing: true,
};

interface SearchIndexCollectorProps {
  Pages?: ComponentDef;
  renderChild: RenderChildFn;
}

export function SearchIndexCollector({ Pages, renderChild }: SearchIndexCollectorProps) {
  const appContext = useAppContext();
  const setIndexing = useSearchContextSetIndexing();

  const [indexState, setIndexState] = useState<{ index: number; done: boolean }>({
    index: 0,
    done: false,
  });

  useEffect(() => {
    return () => {
      setIndexing(false);
    };
  }, [setIndexing]);

  // 1. Memoize the list of pages to be indexed
  const pagesToIndex = useMemo(() => {
    return (
      Pages?.children?.filter(
        (child) =>
          child.type === "Page" && // Ensure 'Page' matches your actual component type name
          child.props?.url && // Ensure URL exists
          !child.props.url.includes("*") &&
          !child.props.url.includes(":"),
      ) || []
    );
  }, [Pages?.children]);

  const [, startTransitionParent] = useTransition(); // Transition for parent updates

  const handlePageIndexed = useCallback(() => {
    startTransitionParent(() => {
      setIndexState((prev) => {
        const nextIndex = prev.index + 1;
        return {
          index: nextIndex,
          done: nextIndex >= pagesToIndex.length,
        };
      });
    });
  }, [pagesToIndex.length]); // Recreate if the total number of pages changes

  if (!appContext.appGlobals?.searchIndexEnabled || indexState.done) {
    return null;
  }

  const currentPageToProcess = pagesToIndex[indexState.index];

  if (!currentPageToProcess) {
    // This can happen if pagesToIndex is empty or currentIndex went out of bounds unexpectedly.
    if (pagesToIndex.length === 0 && !indexState.done) {
      setIndexState({ index: 0, done: true });
    }
    return null;
  }

  return (
    <IndexerContext.Provider value={indexerContextValue}>
      {createPortal(
        <div style={HIDDEN_STYLE} aria-hidden="true">
          {/* Render only one PageIndexer at a time */}
          <PageIndexer
            Page={currentPageToProcess}
            renderChild={renderChild}
            onIndexed={handlePageIndexed}
            key={currentPageToProcess.props?.url || indexState.index} // Key ensures re-mount
          />
        </div>,
        document.body,
      )}
    </IndexerContext.Provider>
  );
}

interface PageIndexerProps {
  Page: ComponentDef<typeof PageMd>;
  renderChild: RenderChildFn;
  onIndexed: () => void;
}

function PageIndexer({ Page, renderChild, onIndexed }: PageIndexerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const pageUrl = Page.props?.url || "";
  const navLabel = Page.props?.navLabel || "";
  const searchContextUpdater = useSearchContextUpdater();

  const [phase, setPhase] = useState<"rendering" | "extracting" | "done">("rendering");
  const [, startTransition] = useTransition();

  // Effect 1: Schedule the rendering of the Page's children (low priority)
  useEffect(() => {
    startTransition(() => {
      setPhase("rendering"); // Ensure we're in rendering phase
    });
  }, [pageUrl]);

  // Effect 2: Extract content once Page.children is rendered and ref is available (low priority)
  useEffect(() => {
    if (phase === "rendering" && contentRef.current) {
      startTransition(() => {
        const currentContent = contentRef.current;
        if (!currentContent) return;

        setPhase("extracting");

        const clone = currentContent.cloneNode(true) as HTMLDivElement;
        const elementsToRemove = clone.querySelectorAll("style, script");
        elementsToRemove.forEach((el) => el.remove());
        const titleElement = clone.querySelector("h1");
        const title = titleElement
          ? titleElement.innerText
          : navLabel || pageUrl.split("/").pop() || pageUrl;
        titleElement?.remove();
        const textContent = (clone.textContent || "").trim().replace(/\s+/g, " ");

        searchContextUpdater({
          title,
          content: textContent,
          path: pageUrl,
        });

        onIndexed();
        setPhase("done");
      });
    }
  }, [phase, pageUrl, searchContextUpdater, onIndexed, navLabel]);

  if (phase === "done") {
    return null;
  }

  return <div ref={contentRef}>{renderChild(Page.children)}</div>;
}
