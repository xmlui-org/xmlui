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
import { ToneSwitcher } from "./ToneSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CodeSelector } from "./CodeSelector";
import { Text } from "../../../../xmlui/src/components/Text/TextNative";

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
          content: options.content,
        },
      };
      const appQueryString = await createQueryString(JSON.stringify(data));
      window.open(`/playground#${appQueryString}`, "_blank");
    },
    [
      appDescription,
      options.fixedTheme,
      options.swapped,
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
      <Box>
        <Box styles={{ gap: "1rem" }}>
          <Text>{appDescription.config?.name}</Text>
          {!options.previewMode && standalone && <CodeSelector />}
        </Box>
        {standalone && (
          <>
            {!options.fixedTheme && <Tooltip trigger={<ToneSwitcher />} label="Change tone" />}
            {!options.fixedTheme &&
              appDescription.availableThemes &&
              appDescription.availableThemes.length > 1 && (
                <Tooltip trigger={<ThemeSwitcher />} label="Change theme" />
              )}
          </>
        )}
        {!options.previewMode && show && (
          <>
            {!standalone && (
              <Tooltip
                trigger={
                  <button className={styles.button} onClick={() => openStandaloneApp(false)}>
                    <RxOpenInNewWindow />
                  </button>
                }
                label="Edit code in new window"
              />
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
            <Tooltip
              trigger={
                <button
                  className={styles.button}
                  onClick={() => {
                    if (standalone) {
                      setDialogOpen(true);
                    } else {
                      dispatch(resetApp());
                    }
                  }}
                >
                  <LiaUndoAltSolid />
                </button>
              }
              label="Reset the app"
            />
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
            <Tooltip
              trigger={
                <button className={styles.button} onClick={() => openStandaloneApp()}>
                  <RxOpenInNewWindow />
                </button>
              }
              label="Preview in fullscreen"
            />
            <Tooltip
              trigger={
                <button className={styles.button} onClick={() => download()}>
                  <RxDownload />
                </button>
              }
              label="Download app"
            />
          </>
        )}
      </Box>
      {appDescription.config?.description && (
        <div className={styles.description}>{appDescription.config?.description}</div>
      )}
    </div>
  );
};
