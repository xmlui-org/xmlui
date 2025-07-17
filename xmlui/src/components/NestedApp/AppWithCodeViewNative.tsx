import { type ReactNode, useCallback, useState } from "react";
import { IndexAwareNestedApp } from "./NestedAppNative";
import { Markdown } from "../Markdown/Markdown";
import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { Button } from "../Button/ButtonNative";
import styles from "./NestedApp.module.scss";
import { Tooltip } from "./Tooltip";
import { RxOpenInNewWindow } from "react-icons/rx";
import { LiaUndoAltSolid } from "react-icons/lia";
import { createQueryString, withoutTrailingSlash } from "./utils";
import { useAppContext } from "../../components-core/AppContext";
import classnames from "classnames";
import Logo from "./logo.svg?react";

type AppWithCodeViewNativeProps = {
  // Markdown content to display in the left column
  markdown: string;
  // Display layout in side-by-side mode (horizontal) when true,
  // or stacked (vertical) when false or undefined
  splitView?: boolean;
  // Indicates that the split view should initially show the code
  initiallyShowCode?: boolean;
  // Optional URL for the playground pop-out
  popOutUrl?: string;
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
  noHeader?: boolean;
  immediate?: boolean;
  withSplashScreen?: boolean;
  closeButton?: ReactNode;
  controlsWidth?: string | number;
};

/**
 * A component that displays markdown content on the left and a NestedApp on the right
 */
export function AppWithCodeViewNative({
  markdown,
  splitView,
  withFrame = true,
  noHeader = false,
  initiallyShowCode = false,
  popOutUrl,
  app,
  api,
  components = [],
  config,
  activeTone,
  activeTheme,
  title,
  height,
  allowPlaygroundPopup,
  withSplashScreen,
  immediate,
  closeButton = null,
  controlsWidth,
}: AppWithCodeViewNativeProps): ReactNode {
  const [showCode, setShowCode] = useState(initiallyShowCode);
  const appContext = useAppContext();
  const [refreshVersion, setRefreshVersion] = useState(0);

  const safePopOutUrl = withoutTrailingSlash(
    popOutUrl || appContext?.appGlobals?.popOutUrl || "https://docs.xmlui.com/#/playground",
  );
  const openPlayground = useCallback(async () => {
    const data = {
      standalone: {
        app,
        components,
        config: {
          name: title,
          themes: [],
          defaultTheme: activeTheme,
        },
        api: api,
      },
      options: {
        fixedTheme: false,
        swapped: false,
        previewMode: false,
        orientation: "horizontal",
        activeTheme,
        activeTone,
        content: "app",
      },
    };
    const appQueryString = await createQueryString(JSON.stringify(data));
    window.open(`${safePopOutUrl}/#${appQueryString}`, "_blank");
  }, [app, components, title, activeTheme, api, activeTone, safePopOutUrl]);

  if (withFrame) {
    return (
      <>
        {!!markdown && !splitView && <Markdown>{markdown}</Markdown>}
        <div className={styles.nestedAppContainer} style={{ height }}>
          {!noHeader && (
            <div className={styles.header}>
              {!splitView && <span className={styles.headerText}>{title}</span>}
              {splitView && (
                <>
                  <div className={styles.wrapper} style={{ width: controlsWidth }}>
                    <Logo className={styles.logo} />
                  </div>
                  <div className={styles.viewControls}>
                    <Button
                      onClick={() => setShowCode(true)}
                      className={classnames(styles.splitViewButton, {
                        [styles.show]: showCode,
                        [styles.hide]: !showCode,
                      })}
                    >
                      XML
                    </Button>
                    <Button
                      onClick={() => setShowCode(false)}
                      className={classnames(styles.splitViewButton, {
                        [styles.show]: !showCode,
                        [styles.hide]: showCode,
                      })}
                    >
                      UI
                    </Button>
                  </div>
                </>
              )}
              <div className={styles.wrapper} style={{ width: controlsWidth }}>
                {allowPlaygroundPopup && (
                  <Tooltip
                    trigger={
                      <button
                        className={styles.headerButton}
                        onClick={() => {
                          openPlayground();
                        }}
                      >
                        <RxOpenInNewWindow />
                      </button>
                    }
                    label="View and edit in new full-width window"
                  />
                )}
                <Tooltip
                  trigger={
                    <button
                      className={styles.headerButton}
                      onClick={() => {
                        setShowCode(false);
                        setRefreshVersion(refreshVersion + 1);
                      }}
                    >
                      <LiaUndoAltSolid />
                    </button>
                  }
                  label="Reset the app"
                />
                {closeButton}
              </div>
            </div>
          )}
          <div className={styles.contentContainer}>
            <Markdown
              className={classnames(styles.splitViewMarkdown, { [styles.hidden]: !showCode })}
            >
              {markdown}
            </Markdown>
            <IndexAwareNestedApp
              className={classnames({ [styles.hidden]: showCode })}
              height={"100%"}
              app={app}
              api={api}
              components={components}
              config={config}
              activeTone={activeTone}
              activeTheme={activeTheme}
              refreshVersion={refreshVersion}
              withSplashScreen={withSplashScreen}
              immediate={immediate}
            />
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {!!markdown && <Markdown>{markdown}</Markdown>}
      <IndexAwareNestedApp
        height={height}
        app={app}
        api={api}
        components={components}
        config={config}
        activeTone={activeTone}
        activeTheme={activeTheme}
        refreshVersion={refreshVersion}
        withSplashScreen={withSplashScreen}
        immediate={immediate}
      />
    </>
  );
}

/**
 * Export a named default for easier imports
 */
export default AppWithCodeViewNative;
