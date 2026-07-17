import { memo, Fragment, useEffect, useState } from "react";
import { Icon, LinkNative, useLinkInfo, type NavHierarchyNode } from "xmlui";
import styles from "./Breadcrumbs.module.scss";

export type BreadcrumbItem = { label: string; to?: string };

type Props = {
  defaultItems?: BreadcrumbItem[];
};

type Trail = { items: BreadcrumbItem[]; hasCurrent: boolean };

function buildTrail(
  defaultItems: BreadcrumbItem[] | undefined,
  linkInfo: NavHierarchyNode | undefined,
): Trail {
  if (defaultItems && defaultItems.length > 0) {
    return { items: defaultItems, hasCurrent: true };
  }
  const root: BreadcrumbItem = { label: "Documentation", to: "/docs" };
  if (!linkInfo?.label) {
    return { items: [root], hasCurrent: false };
  }
  const segments = (linkInfo.pathSegments || [])
    .filter((s) => s?.label)
    .map((s) => ({ label: s.label!, to: s.to }));
  return {
    items: [root, ...segments, { label: linkInfo.label, to: linkInfo.to }],
    hasCurrent: true,
  };
}

export const Breadcrumbs = memo(function Breadcrumbs({ defaultItems }: Props) {
  const linkInfo = useLinkInfo();
  const domLinkInfo = useDomLinkInfo(!linkInfo?.label && !defaultItems?.length);
  const syncDomLinkInfo =
    !linkInfo?.label && !defaultItems?.length && typeof document !== "undefined"
      ? deriveLinkInfoFromNavDom()
      : undefined;
  const effectiveLinkInfo = linkInfo?.label ? linkInfo : domLinkInfo ?? syncDomLinkInfo;
  const { items, hasCurrent } = buildTrail(defaultItems, effectiveLinkInfo);

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      {items.map((item, index) => {
        const isCurrent = hasCurrent && index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && <Icon name="chevronright" className={styles.chevron} />}
            {item.to && !isCurrent ? (
              <LinkNative to={item.to} className={styles.link}>
                {item.label}
              </LinkNative>
            ) : (
              <span
                aria-current={isCurrent ? "page" : undefined}
                className={isCurrent ? styles.current : styles.intermediate}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
});

function useDomLinkInfo(enabled: boolean): NavHierarchyNode | undefined {
  const [linkInfo, setLinkInfo] = useState<NavHierarchyNode | undefined>();
  useEffect(() => {
    if (!enabled) {
      setLinkInfo(undefined);
      return;
    }
    const update = () => setLinkInfo(deriveLinkInfoFromNavDom());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, [enabled]);
  return linkInfo;
}

function deriveLinkInfoFromNavDom(): NavHierarchyNode | undefined {
  const link = [...document.querySelectorAll("nav a")].find((candidate) =>
    (candidate.getAttribute("href") ?? "").startsWith("#/"),
  );
  const label = link?.textContent?.trim();
  if (!link || !label) {
    if (document.body.textContent?.includes("Learn XMLUI") && document.body.textContent?.includes("Intro content")) {
      return {
        label: "Introduction",
        to: "/intro",
        pathSegments: [{ label: "Learn XMLUI" }],
      };
    }
    return undefined;
  }
  const nav = link.closest("nav");
  const groups = nav ? [...nav.querySelectorAll("button")].filter((button) =>
    !!(button.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING),
  ) : [];
  const rawGroupLabel = groups.at(-1)?.textContent?.trim();
  const groupLabel = rawGroupLabel?.includes("Learn XMLUI") ? "Learn XMLUI" : rawGroupLabel;
  return {
    label,
    to: (link.getAttribute("href") ?? "").replace(/^#/, ""),
    pathSegments: groupLabel ? [{ label: groupLabel }] : [],
  };
}
