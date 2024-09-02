import React, { useCallback, useEffect, useState } from "react";
import styles from "./Header.module.scss";
import classnames from "classnames";
import { useTheme } from "nextra-theme-docs";
import { Text } from "@components/Text/Text";
import { CodeSelector } from "@/src/components/CodeSelector";
import { Tooltip } from "@/src/components/Tooltip";
import { MdSwapHoriz, MdSwapVert } from "react-icons/md";
import { PiSquareSplitHorizontalLight, PiSquareSplitVerticalLight } from "react-icons/pi";
import { RxOpenInNewWindow, RxReset } from "react-icons/rx";
import { usePlayground } from "@/src/hooks/usePlayground";
import { changeOrientation, resetApp, swapApp } from "@/src/state/store";
import { createQueryString } from "@/src/components/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";

export const Header = () => {
  const { theme, systemTheme } = useTheme();
  const { appDescription, options, dispatch } = usePlayground();

  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);

  const openStandaloneApp = useCallback(async () => {
    const data = {
      standalone: appDescription,
      options: {
        previewMode: options.previewMode,
        orientation: options.orientation,
        activeTheme: options.activeTheme,
        content: options.content,
      },
    };
    const appQueryString = await createQueryString(JSON.stringify(data));
    window.open(`/playground#${appQueryString}`, "_blank");
  }, [appDescription, options.previewMode, options.activeTheme, options.orientation, options.content]);

  return (
    <div
      className={classnames(styles.header, {
        [styles.dark]: theme === "dark" || (theme === "system" && systemTheme === "dark"),
      })}
    >
      <div className={styles.box}>
        <Text fontWeight="bold">{appDescription.config?.name}</Text>
        {!options.previewMode && <CodeSelector />}
      </div>
      <div className={styles.box}>
        {appDescription.availableThemes && appDescription.availableThemes.length > 1 && (
          <Tooltip trigger={<ThemeSwitcher />} label="Change theme" />
        )}
        {!options.previewMode && show && (
          <>
            <Tooltip
              trigger={
                <button className={styles.button} onClick={() => dispatch(swapApp())}>
                  {options.orientation === "vertical" ? <MdSwapHoriz /> : <MdSwapVert />}
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
        )}
        {options.allowStandalone && (
          <Tooltip
            trigger={
              <button className={styles.button} onClick={() => openStandaloneApp()}>
                <RxOpenInNewWindow />
              </button>
            }
            label="Open in new window"
          />
        )}
        <Tooltip
          trigger={
            <button className={styles.button} onClick={() => dispatch(resetApp())}>
              <RxReset />
            </button>
          }
          label="Reset the app"
        />
      </div>
    </div>
  );
};
