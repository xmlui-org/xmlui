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

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true); // Ensure document.body is available

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDoneIndexing, setIsDoneIndexing] = useState(false);
  const [, startTransitionParent] = useTransition(); // Transition for parent updates

  const handlePageIndexed = useCallback(() => {
    startTransitionParent(() => {
      // Transition the update to the next page
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= pagesToIndex.length) {
          // console.log("All pages indexed.");
          setIsDoneIndexing(true); // All pages processed
        }
        return nextIndex;
      });
    });
  }, [pagesToIndex.length]); // Recreate if the total number of pages changes

  if (!appContext.appGlobals?.searchIndexEnabled || isDoneIndexing || !isClient) {
    return null;
  }

  const currentPageToProcess = pagesToIndex[currentIndex];

  if (!currentPageToProcess) {
    // This can happen if pagesToIndex is empty or currentIndex went out of bounds unexpectedly.
    // Setting isDoneIndexing if pagesToIndex is empty initially.
    if (pagesToIndex.length === 0 && currentIndex === 0 && !isDoneIndexing) {
      setIsDoneIndexing(true);
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
            key={currentPageToProcess.props?.url || currentIndex} // Key ensures re-mount
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

  const [isContentRendered, setIsContentRendered] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [isProcessing, startTransition] = useTransition();

  // Effect 1: Schedule the rendering of the Page's children (low priority)
  useEffect(() => {
    // console.log(`PageIndexer (${pageUrl}): Scheduling content render.`);
    startTransition(() => {
      setIsContentRendered(true); // This will trigger rendering of Page.children
    });
  }, [pageUrl]); // Re-run if the Page prop itself changes identity (due to key in parent)

  // Effect 2: Extract content once Page.children is rendered and ref is available (low priority)
  useEffect(() => {
    if (isContentRendered && contentRef.current && !isCollected && !isProcessing) {
      // console.log(`PageIndexer (${pageUrl}): Content rendered, scheduling extraction.`);
      startTransition(() => {
        // console.log(`PageIndexer (${pageUrl}): Starting extraction...`);
        const currentContent = contentRef.current; // Capture ref value
        if (!currentContent) return;

        const clone = currentContent.cloneNode(true) as HTMLDivElement;
        const elementsToRemove = clone.querySelectorAll("style, script");
        elementsToRemove.forEach((el) => el.remove());
        const titleElement = clone.querySelector("h1");
        const title = titleElement
          ? titleElement.innerText
          : navLabel || pageUrl.split("/").pop() || pageUrl;
        titleElement?.remove(); // Remove title element from clone to avoid duplication
        const textContent = (clone.textContent || "").trim().replace(/\s+/g, " ");

        const entry = {
          title: title,
          content: textContent,
          path: pageUrl,
        };

        searchContextUpdater(entry);
        // console.log(`PageIndexer (${pageUrl}): Extraction complete, signaling parent.`);
        onIndexed(); // Signal completion to parent
        setIsCollected(true); // Mark as collected
      });
    }
  }, [
    isContentRendered,
    pageUrl,
    searchContextUpdater,
    onIndexed,
    isCollected,
    isProcessing,
    navLabel,
  ]); // Ensure all dependencies are listed

  // If this PageIndexer instance's work is done, or content not yet rendered, render nothing.
  // The parent (SearchIndexCollector) will unmount this and mount the next one.
  if (isCollected || !isContentRendered) {
    // console.log(`PageIndexer (${pageUrl}): Null render (isCollected: ${isCollected}, isContentRendered: ${isContentRendered})`);
    return null;
  }

  // This part renders when isContentRendered is true and isCollected is false.
  // The content needs to be in the DOM for contentRef.current to be populated.
  // console.log(`PageIndexer (${pageUrl}): Rendering content for ref population.`);
  return <div ref={contentRef}>{renderChild(Page.children)}</div>;
}
