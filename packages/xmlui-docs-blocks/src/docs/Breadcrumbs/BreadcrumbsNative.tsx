import { memo, Fragment } from "react";
import { Icon, LinkNative, useLinkInfo, type NavHierarchyNode } from "xmlui";
import styles from "./Breadcrumbs.module.scss";

type BreadcrumbItem = Pick<NavHierarchyNode, "label" | "to">;

type Props = {
  useDefault?: boolean;
};

export const defaultProps: Required<Pick<Props, "useDefault">> = {
  useDefault: false,
};

const DEFAULT_ITEMS: BreadcrumbItem[] = [
  { label: "Documentation", to: "/docs" },
  { label: "Learn XMLUI", to: "/docs/learn" },
  { label: "Introduction" },
];

function buildItems(linkInfo: NavHierarchyNode | undefined): BreadcrumbItem[] {
  const root: BreadcrumbItem = { label: "Documentation", to: "/docs" };
  if (!linkInfo?.label) return [root];
  const segments = (linkInfo.pathSegments || []).filter((s) => s?.label);
  return [root, ...segments, { label: linkInfo.label, to: linkInfo.to }];
}

export const Breadcrumbs = memo(function Breadcrumbs({
  useDefault = defaultProps.useDefault,
}: Props) {
  const linkInfo = useLinkInfo();
  const items = useDefault ? DEFAULT_ITEMS : buildItems(linkInfo);

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
