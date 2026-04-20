import { memo, Fragment } from "react";
import { Icon, LinkNative, useLinkInfo, type NavHierarchyNode } from "xmlui";
import styles from "./Breadcrumbs.module.scss";

export type BreadcrumbItem = { label: string; to?: string };

type Props = {
  defaultItems?: BreadcrumbItem[];
};

function buildItems(linkInfo: NavHierarchyNode | undefined): BreadcrumbItem[] {
  const root: BreadcrumbItem = { label: "Documentation", to: "/docs" };
  if (!linkInfo?.label) return [root];
  const segments = (linkInfo.pathSegments || [])
    .filter((s) => s?.label)
    .map((s) => ({ label: s.label!, to: s.to }));
  return [root, ...segments, { label: linkInfo.label, to: linkInfo.to }];
}

export const Breadcrumbs = memo(function Breadcrumbs({ defaultItems }: Props) {
  const linkInfo = useLinkInfo();
  const items =
    defaultItems && defaultItems.length > 0 ? defaultItems : buildItems(linkInfo);

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && <Icon name="chevronright" className={styles.chevron} />}
            {item.to && !isLast ? (
              <LinkNative to={item.to} className={styles.link}>
                {item.label}
              </LinkNative>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className={isLast ? styles.current : styles.intermediate}
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
