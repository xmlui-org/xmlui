import { useState, type ReactNode, useCallback } from "react";
import { IndexAwareNestedApp } from "./NestedAppNative";
import { Markdown } from "../Markdown/Markdown";
import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { Button } from "../Button/ButtonNative";
import styles from "./NestedApp.module.scss";
import { useLogoUrl } from "../AppHeader/AppHeaderNative";
import { Tooltip } from "./Tooltip";
import { RxOpenInNewWindow } from "react-icons/rx";
import { LiaUndoAltSolid } from "react-icons/lia";
import { createQueryString } from "./utils";
import { useAppContext } from "../../components-core/AppContext";

type AppWithCodeViewNativeProps = {
  /**
   * Markdown content to display in the left column
   */
  markdown: string;
  /**
   * Display layout in side-by-side mode (horizontal) when true,
   * or stacked (vertical) when false or undefined
   */
  splitView?: boolean;
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
  splitView,
  app,
  api,
  components = [],
  config,
  activeTone,
  activeTheme,
  title,
  height,
  allowPlaygroundPopup,
}: AppWithCodeViewNativeProps): ReactNode {
  const [showCode, setShowCode] = useState(false);
  const logoUrl = useLogoUrl();
  const { appGlobals } = useAppContext();
  const [refreshVersion, setRefreshVersion] = useState(0);

  const useHashBasedRouting = appGlobals?.useHashBasedRouting || true;
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
    window.open(
      useHashBasedRouting
        ? `https://docs.xmlui.com/#/playground#${appQueryString}`
        : `https://docs.xmlui.com/playground#${appQueryString}`,
      "_blank",
    );
  }, [app, components, title, activeTheme, api, activeTone, useHashBasedRouting]);

  if (splitView) {
    return (
      <div className={styles.nestedAppContainer} style={{ height }}>
          <div className={styles.header}>
            <img src={logoUrl} className={styles.logo} alt="Logo" />
            <div className={styles.viewControls}>
              <Button
                onClick={() => setShowCode(true)}
                variant={showCode ? "solid" : "ghost"}
                style={{
                  backgroundColor: !showCode ? "transparent" : "",
                  padding: "4px 6px",
                  fontSize: 14,
                  width: 100,
                }}
              >
                Code
              </Button>
              <Button
                onClick={() => setShowCode(false)}
                variant={showCode ? "ghost" : "solid"}
                style={{
                  backgroundColor: showCode ? "transparent" : "",
                  padding: "4px 6px",
                  fontSize: 14,
                  width: 100,
                }}
              >
                App
              </Button>
            </div>
            <div>
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
                      setRefreshVersion(refreshVersion + 1);
                    }}
                  >
                    <LiaUndoAltSolid />
                  </button>
                }
                label="Reset the app"
              />
            </div>
          </div>
          <div style={{width: "100%", height: "100%", overflow: "auto"}}>
            {showCode && (
                <Markdown>{markdown}</Markdown>
            )}
            {!showCode && (
                <IndexAwareNestedApp
                  refVersion={refreshVersion}
                  app={app}
                  api={api}
                  components={components}
                  config={config}
                  activeTone={activeTone}
                  activeTheme={activeTheme}
                  title={title}
                  allowPlaygroundPopup={allowPlaygroundPopup}
                  withFrame={false}
                />
            )}
          </div>
      </div>
    );
  }
  return (
    <>
      <div>
        <Markdown>{markdown}</Markdown>
      </div>
      <div>
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
          withFrame={true}
        />
      </div>
    </>
  );
}

/**
 * Export a named default for easier imports
 */
export default AppWithCodeViewNative;
