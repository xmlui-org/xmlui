import { useState, type ReactNode } from "react";
import { IndexAwareNestedApp } from "./NestedAppNative";
import { Markdown } from "../Markdown/Markdown";
import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { Stack } from "../Stack/StackNative";
import { Button } from "../Button/ButtonNative";

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
  if (splitView) {
    return (
      <div style={{ backgroundColor: "yellow", padding: "1rem" }}>
        <Stack orientation="horizontal">
          <Button onClick={() => setShowCode(true)}>Show Code</Button>
          <Button onClick={() => setShowCode(false)}>Show App</Button>
          { /* Add the pop-out and reset icons with tooltips here */}
        </Stack>
        <div style={{height}}>
          {showCode && (
            <div>
              <Markdown>{markdown}</Markdown>
            </div>
          )}
          {!showCode && (
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
                withFrame={false}
              />
            </div>
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
