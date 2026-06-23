import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps, SkipLinkMd } from "./SkipLink";
import styles from "./SkipLink.module.scss";

export const skipLinkRenderer = wrapComponent({
  name: "SkipLink",
  metadata: SkipLinkMd,
  renderer: ({ adapter }) => {
    const target = adapter.stringProp("target", defaultProps.target) ?? defaultProps.target;
    const label = adapter.stringProp("label", defaultProps.label) ?? defaultProps.label;
    const href = target.startsWith("#") ? target : `#${target}`;
    return (
      <a
        {...adapter.rootAttrs()}
        className={`${adapter.className} ${styles.skipLink}`}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          activateSkipTarget(href.slice(1));
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          activateSkipTarget(href.slice(1));
        }}
      >
        {label}
      </a>
    );
  },
});

function activateSkipTarget(id: string): void {
  const targetEl = findSkipTarget(id);
  if (!targetEl) {
    return;
  }
  const focusTarget = getFocusableSkipTarget(targetEl);
  focusTarget.focus?.({ preventScroll: true });
  focusTarget.scrollIntoView?.({ block: "start" });
}

function findSkipTarget(id: string): HTMLElement | null {
  const escapedId = globalThis.CSS?.escape?.(id) ?? id.replace(/["\\]/g, "\\$&");
  return (
    document.getElementById(id) ??
    document.querySelector<HTMLElement>(`[data-xmlui-id="${escapedId}"]`) ??
    document.querySelector<HTMLElement>(`[data-testid="${escapedId}"]`)
  );
}

function getFocusableSkipTarget(element: HTMLElement): HTMLElement {
  if (element.matches("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")) {
    return element;
  }
  return element.querySelector<HTMLElement>(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
  ) ?? element;
}
