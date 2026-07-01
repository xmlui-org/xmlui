import { useCallback, useEffect, useMemo, useRef } from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { BookmarkMd, defaultProps } from "./Bookmark";
import styles from "./Bookmark.module.scss";

export const bookmarkRenderer = wrapComponent({
  name: "Bookmark",
  metadata: BookmarkMd,
  renderer: ({ adapter }) => {
    const id = adapter.stringProp("id", "");
    const refName = adapter.stringProp("ref", "");
    const title = adapter.stringProp("title", "");
    const level = adapter.numberProp("level", defaultProps.level);
    const omitFromToc = adapter.booleanProp("omitFromToc", defaultProps.omitFromToc);
    const ref = useRef<HTMLSpanElement>(null);
    const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
      const target = ref.current;
      if (!target) {
        return;
      }

      let scrollableParent = target.parentElement;
      while (scrollableParent) {
        const style = window.getComputedStyle(scrollableParent);
        const isScrollable =
          (style.overflowY === "scroll" || style.overflowY === "auto") &&
          scrollableParent.scrollHeight > scrollableParent.clientHeight;

        if (isScrollable) {
          const rect = target.getBoundingClientRect();
          const parentRect = scrollableParent.getBoundingClientRect();
          const relativeTop = rect.top - parentRect.top + scrollableParent.scrollTop;
          scrollableParent.scrollTo({
            top: relativeTop,
            behavior: options?.behavior || "smooth",
          });
          return;
        }
        scrollableParent = scrollableParent.parentElement;
      }

      target.scrollIntoView({
        behavior: options?.behavior || "smooth",
        block: "start",
      });
    }, []);
    const api = useMemo(() => ({
      scrollIntoView,
    }), [scrollIntoView]);

    const { registerApi } = adapter;

    useEffect(() => {
      registerApi(api);
    }, [api, registerApi]);

    useEffect(() => {
      if (!refName) {
        return;
      }
      adapter.scope.references[refName] = api;
      adapter.scope.store.invalidateReference(refName);
      return () => {
        if (adapter.scope.references[refName] === api) {
          delete adapter.scope.references[refName];
          adapter.scope.store.invalidateReference(refName);
        }
      };
    }, [adapter.scope, api, refName]);

    return (
      <span
        {...adapter.rootAttrs()}
        ref={ref}
        id={id || undefined}
        className={[adapter.className, styles.anchorRef].filter(Boolean).join(" ")}
        data-anchor="true"
        data-bookmark-level={String(level)}
        data-bookmark-title={title || undefined}
        data-bookmark-omit-from-toc={String(omitFromToc)}
      >
        {adapter.renderChildren()}
      </span>
    );
  },
});
