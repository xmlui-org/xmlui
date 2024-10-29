import React, { useCallback, useEffect, useState } from "react";
import styles from "./Header.module.scss";
import classnames from "classnames";
import { useTheme } from "nextra-theme-docs";
import { Text } from "@components/Text/TextNative";
import { CodeSelector } from "@/src/components/CodeSelector";
import { Tooltip } from "@/src/components/Tooltip";
import { MdSwapHoriz, MdSwapVert } from "react-icons/md";
import { PiSquareSplitHorizontalLight, PiSquareSplitVerticalLight } from "react-icons/pi";
import { RxOpenInNewWindow, RxReset, RxDownload, RxCode } from "react-icons/rx";
import { usePlayground } from "@/src/hooks/usePlayground";
import { changeOrientation, resetApp, swapApp } from "@/src/state/store";
import { createQueryString } from "@/src/components/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { SpaceFiller } from "@components/SpaceFiller/SpaceFillerNative";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export const Header = ({ standalone = false }: { standalone?: boolean }) => {
  const { theme, systemTheme } = useTheme();
  const { appDescription, options, dispatch } = usePlayground();

  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);

  const openStandaloneApp = useCallback(
    async (previewMode = true) => {
      const data = {
        standalone: appDescription,
        options: {
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
      options.previewMode,
      options.activeTheme,
      options.orientation,
      options.content,
    ],
  );

  const handleDownloadZip = async () => {
    const zip = new JSZip();

    zip.file("Main.xmlui", appDescription.app);
    zip.file("config.json", JSON.stringify(appDescription.config, null, 2));

    if (appDescription.components.length > 0) {
      const components = zip.folder("components");
      appDescription.components.forEach((component) => {
        components.file(`${component.name}.xmlui`, component.component);
      });
    }
    if (appDescription.config.themes.length > 0) {
      const components = zip.folder("themes");
      appDescription.config.themes.forEach((theme) => {
        components.file(`${theme.id}.json`, JSON.stringify(theme, null, 2));
      });
    }
    try {
      const content = await zip.generateAsync({ type: "blob" });

      saveAs(content, `${appDescription.config.name.trim()}.zip`);
    } catch (error) {
      console.error("An error occurred while generating the ZIP:", error);
    }
  };

  return (
    <div
      className={classnames(styles.header, {
        [styles.dark]: theme === "dark" || (theme === "system" && systemTheme === "dark"),
      })}
    >
      <div className={styles.box}>
        <Text>{appDescription.config?.name}</Text>
        {!options.previewMode && <CodeSelector />}
        <SpaceFiller />
        {appDescription.availableThemes && appDescription.availableThemes.length > 1 && (
          <Tooltip trigger={<ThemeSwitcher />} label="Change theme" />
        )}
        {!options.previewMode && show && (
          <>
            {!standalone && (
              <Tooltip
                trigger={
                  <button className={styles.button} onClick={() => openStandaloneApp(false)}>
                    <RxCode />
                  </button>
                }
                label="Edit code in new window"
              />
            )}
            {standalone && (
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
            )}
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
        <Tooltip
          trigger={
            <button className={styles.button} onClick={() => handleDownloadZip()}>
              <RxDownload />
            </button>
          }
          label="Download app"
        />
      </div>
      {appDescription.config?.description && (
        <div className={styles.description}>{appDescription.config?.description}</div>
      )}
    </div>
  );
};
