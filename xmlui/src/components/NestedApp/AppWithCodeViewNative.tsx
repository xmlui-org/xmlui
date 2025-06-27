import { type ReactNode } from "react";
import styles from "./AppWithCodeView.module.scss";
import classnames from "classnames";
import { IndexAwareNestedApp } from "./NestedAppNative";
import { Markdown } from "../Markdown/Markdown";
import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { Stack } from "../Stack/StackNative";

type AppWithCodeViewNativeProps = {
  /**
   * Markdown content to display in the left column
   */
  markdown: string;
  /**
   * Display layout in side-by-side mode (horizontal) when true,
   * or stacked (vertical) when false or undefined
   */
  sideBySide?: boolean;
  api?: any;
  app: string;
  components?: any[];
  config?: any;
  activeTone?: ThemeTone;
  activeTheme?: string;
  title?: string;
  height?: string | number;
  allowPlaygroundPopup?: boolean;
  withFrame?: boolean;
};

/**
 * A component that displays markdown content on the left and a NestedApp on the right
 */
export function AppWithCodeViewNative({
  markdown,
  sideBySide,
  app,
  api,
  components = [],
  config,
  activeTone,
  activeTheme,
  title,
  height,
  allowPlaygroundPopup,
  withFrame,
}: AppWithCodeViewNativeProps): ReactNode {
  return (
    <div
      className={classnames(styles.container, {
        [styles.horizontal]: sideBySide,
        [styles.vertical]: !sideBySide,
      })}
    >
      <div className={classnames({ [styles.column]: sideBySide })}>
        <Markdown>{markdown}</Markdown>
      </div>
      <div className={classnames({ [styles.column]: sideBySide })}>
        <IndexAwareNestedApp
          app={app}
          api={api}
          components={components}
          config={config}
          activeTone={activeTone}
          activeTheme={activeTheme}
          title={title}
          height={height}
          allowPlaygroundPopup={allowPlaygroundPopup}
          withFrame={sideBySide ? false : withFrame}
        />
      </div>
    </div>
  );
}

/**
 * Export a named default for easier imports
 */
export default AppWithCodeViewNative;
