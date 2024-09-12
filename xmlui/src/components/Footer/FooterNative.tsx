import React, { ReactNode } from "react";
import styles from "./Footer.module.scss";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { paddingSubject } from "@components-core/theming/themes/base-utils";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { createPortal } from "react-dom";
import classnames from "@components-core/utils/classnames";

// =====================================================================================================================
// React Footer component implementation

function Footer({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style: React.CSSProperties;
  className?: string;
}) {
  const appLayoutContext = useAppLayoutContext();
  const content = (
    <div className={styles.outerWrapper}>
      <div className={classnames(styles.wrapper, className)} style={style}>
        {children}
      </div>
    </div>
  );

  const { footerRoot } = appLayoutContext || {};
  if (footerRoot) {
    return createPortal(content, footerRoot);
  }
  return content;
}

