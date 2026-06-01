import { useEffect, useState } from "react";

// Single source of truth for the mobile breakpoint. Mirrors Viewport.tsx's
// MOBILE_MAX_WIDTH so the DatePicker drawer flips at the same width the rest of
// the app treats as "mobile".
export const MOBILE_MAX_WIDTH = 640;

const QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;

const matches = (): boolean => {
  // SSR / non-browser: assume desktop. The component is client-rendered in the
  // Tauri/SPA shell, so this only guards the very first paint.
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(QUERY).matches;
};

/**
 * Returns `true` while the viewport is mobile-sized (≤ 640px). Updates on
 * media-query changes and resizes, and cleans up its listeners on unmount.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(matches);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mq = window.matchMedia(QUERY);
    const update = () => setIsMobile(mq.matches);
    // Sync once in case the viewport changed between the initial render and the
    // effect firing (e.g. hydration on a resized window).
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
    };
  }, []);

  return isMobile;
}

export default useIsMobile;
