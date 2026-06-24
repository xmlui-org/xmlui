import { useEffect, useMemo, useRef } from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { BookmarkMd, defaultProps } from "./Bookmark";
import styles from "./Bookmark.module.scss";

export const bookmarkRenderer = wrapComponent({
  name: "Bookmark",
  metadata: BookmarkMd,
  renderer: ({ adapter }) => {
    const id = adapter.stringProp("id", "");
    const title = adapter.stringProp("title", "");
    const level = adapter.numberProp("level", defaultProps.level);
    const omitFromToc = adapter.booleanProp("omitFromToc", defaultProps.omitFromToc);
    const ref = useRef<HTMLSpanElement>(null);
    const api = useMemo(() => ({
      scrollIntoView: (options?: ScrollIntoViewOptions) => {
        ref.current?.scrollIntoView({
          behavior: options?.behavior ?? "smooth",
          block: options?.block ?? "start",
          inline: options?.inline,
        });
      },
    }), []);

    useEffect(() => {
      adapter.registerApi(api);
    }, [adapter, api]);

    return (
      <span
        {...adapter.rootAttrs()}
        ref={ref}
        id={id || undefined}
        className={`${adapter.className} ${styles.anchorRef}`}
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
