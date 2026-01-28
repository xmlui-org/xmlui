import { RefObject, useEffect } from "react";

interface IndicatorPosition {
  top: number;
  left: number;
  height: number;
}

/**
 * Hook to manage the positioning of an indicator element over the active list item.
 * Updates the indicator's position whenever the active anchor changes.
 */
export function useIndicatorPosition(
  activeAnchorId: string | null,
  containerRef: RefObject<HTMLElement>,
  indicatorRef: RefObject<HTMLDivElement>,
  activeClassName: string,
): void {
  useEffect(() => {
    if (!activeAnchorId || !containerRef.current || !indicatorRef.current) {
      if (indicatorRef.current) {
        indicatorRef.current.style.display = "none";
      }
      return;
    }

    const activeItem = containerRef.current.querySelector(
      `li.${activeClassName}`,
    );
    if (!activeItem) return;

    const navRect = containerRef.current.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    const position: IndicatorPosition = {
      top: itemRect.top - navRect.top + containerRef.current.scrollTop,
      left: itemRect.left - navRect.left,
      height: itemRect.height,
    };

    Object.assign(indicatorRef.current.style, {
      top: `${position.top}px`,
      left: `${position.left}px`,
      height: `${position.height}px`,
      display: "block",
    });
  }, [activeAnchorId, activeClassName, containerRef, indicatorRef]);
}
