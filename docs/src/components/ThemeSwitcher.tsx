import { usePlayground } from "@/src/hooks/usePlayground";
import { MdOutlinePalette } from "react-icons/md";
import * as React from "react";
import styles from "./ThemeSwitcher.module.scss";
import { useTheme } from "nextra-theme-docs";
import classnames from "classnames";
import * as RadixMenu from "@radix-ui/react-dropdown-menu";
import { FiCheck } from "react-icons/fi";
import { activeThemeChanged } from "@/src/state/store";
import { forwardRef } from "react";

export const ThemeSwitcher = forwardRef<HTMLButtonElement>((props, ref) => {
  const { theme, systemTheme } = useTheme();
  const { appDescription, options, dispatch } = usePlayground();

  return (
    <RadixMenu.Root modal={false}>
      <RadixMenu.Trigger className={styles.button} ref={ref} {...props}>
        <MdOutlinePalette />
      </RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content
          className={classnames(styles.RadixMenuContent, {
            [styles.dark]: theme === "dark" || (theme === "system" && systemTheme === "dark"),
          })}
        >
          <RadixMenu.Label className={styles.RadixMenuLabel}>Theme</RadixMenu.Label>
          <RadixMenu.RadioGroup
            className={styles.RadixMenuRadioGroup}
            value={options.activeTheme}
            onValueChange={(value: string) => dispatch(activeThemeChanged(value))}
          >
            {appDescription.availableThemes &&
              appDescription.availableThemes.length > 0 &&
              appDescription.availableThemes.map((theme, index) => (
                <RadixMenu.RadioItem
                  className={styles.RadixMenuRadioItem}
                  value={theme.id}
                  key={index}
                >
                  {theme.id}
                  <RadixMenu.ItemIndicator className={styles.RadixMenuItemIndicator}>
                    <FiCheck />
                  </RadixMenu.ItemIndicator>
                </RadixMenu.RadioItem>
              ))}
          </RadixMenu.RadioGroup>
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
});

ThemeSwitcher.displayName = "ThemeSwitcher";
