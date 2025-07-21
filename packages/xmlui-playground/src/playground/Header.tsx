import React, { useCallback, useEffect, useState } from "react";
import styles from "./Header.module.scss";
import classnames from "classnames";
import { RxOpenInNewWindow, RxDownload } from "react-icons/rx";
import { LiaUndoAltSolid } from "react-icons/lia";
import { usePlayground } from "../hooks/usePlayground";
import { resetApp } from "../state/store";
import { handleDownloadZip } from "../utils/helpers";
import { createQueryString } from "./utils";
import { Box } from "./Box";
import { Tooltip } from "./Tooltip";
import ConfirmationDialog from "./ConfirmationDialog";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CodeSelector } from "./CodeSelector";
import { Button, Text, Logo } from "xmlui";
import { ToneSwitcher } from "./ToneSwitcher";

export const Header = ({ standalone = false }: { standalone?: boolean }) => {
  const { appDescription, options, dispatch } = usePlayground();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);

  const openStandaloneApp = useCallback(
    async (previewMode = true) => {
      const data = {
        standalone: appDescription,
        options: {
          fixedTheme: options.fixedTheme,
          swapped: options.swapped,
          previewMode: previewMode,
          orientation: options.orientation,
          activeTheme: options.activeTheme,
          activeTone: options.activeTone,
          content: options.content,
        },
      };
      const appQueryString = await createQueryString(JSON.stringify(data));
      window.open(`/#/playground#${appQueryString}`, "_blank");
    },
    [
      appDescription,
      options.fixedTheme,
      options.swapped,
      options.activeTone,
      options.orientation,
      options.activeTheme,
      options.content,
    ],
  );

  const download = useCallback(() => {
    handleDownloadZip(appDescription);
  }, [appDescription]);

  return (
    <div className={classnames(styles.header)}>
      <Box styles={{ padding: 0, justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Logo style={{ width: "93.8281px", padding: 12, paddingLeft: 0 }} />
          {!options.previewMode && standalone && <CodeSelector />}
        </div>
        <Text>{appDescription.config?.name}</Text>
        <div style={{ display: "flex", alignItems: "center" }}>
          {standalone && (
            <>
              {!options.fixedTheme && (
                <Tooltip label="Change tone">
                  <ToneSwitcher />
                </Tooltip>
              )}
              {!options.fixedTheme &&
                appDescription.availableThemes &&
                appDescription.availableThemes.length > 1 && (
                  <Tooltip label="Change theme">
                    <ThemeSwitcher />
                  </Tooltip>
                )}
            </>
          )}
          {!options.previewMode && show && (
            <>
              {!standalone && (
                <Tooltip label="View and edit in new full-width window">
                  <Button variant="ghost" onClick={() => openStandaloneApp(false)}>
                    <RxOpenInNewWindow />
                  </Button>
                </Tooltip>
              )}
              <ConfirmationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title="Confirm Reset"
                description="Are you sure you want to reset the app? This action cannot be undone and will reset all code to its initial state."
                onConfirm={() => {
                  dispatch(resetApp());
                  setDialogOpen(false);
                }}
                confirmText="Confirm"
                cancelText="Cancel"
              />
              <Tooltip label="Reset the app">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (standalone) {
                      setDialogOpen(true);
                    } else {
                      dispatch(resetApp());
                    }
                  }}
                >
                  <LiaUndoAltSolid height={24} width={24} />
                </Button>
              </Tooltip>
              {/*            {standalone && (
              <>
                <Tooltip
                  trigger={
                    <button className={styles.button} onClick={() => dispatch(swapApp())}>
                      {options.orientation === "horizontal" ? <MdSwapHoriz /> : <MdSwapVert />}
                    </button>
                  }
                  label="Swap editor and preview"
                />
                <Tooltip
                  trigger={
                    <button className={styles.button} onClick={() => dispatch(changeOrientation())}>
                      {options.orientation === "vertical" ? (
                        <PiSquareSplitHorizontalLight />
                      ) : (
                        <PiSquareSplitVerticalLight />
                      )}
                    </button>
                  }
                  label="Toggle orientation"
                />
              </>
            )}*/}
            </>
          )}
          {standalone && (
            <>
              <Tooltip label="Preview in fullscreen">
                <Button variant="ghost" onClick={() => openStandaloneApp()}>
                  <RxOpenInNewWindow height={24} width={24} />
                </Button>
              </Tooltip>
              <Tooltip label="Download app">
                <Button variant="ghost" onClick={() => download()}>
                  <RxDownload height={24} width={24} />
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      </Box>
      {appDescription.config?.description && (
        <div className={styles.description}>{appDescription.config?.description}</div>
      )}
    </div>
  );
};
