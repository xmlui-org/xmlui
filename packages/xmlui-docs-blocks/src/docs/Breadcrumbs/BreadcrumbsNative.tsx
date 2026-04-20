import { memo, Fragment } from "react";
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
  const { items, hasCurrent } = buildTrail(defaultItems, linkInfo);

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
