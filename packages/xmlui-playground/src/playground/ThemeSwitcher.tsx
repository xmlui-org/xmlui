import { usePlayground } from "../hooks/usePlayground";
import { MdOutlinePalette } from "react-icons/md";
import { activeThemeChanged } from "../state/store";
import { forwardRef } from "react";
import { Button, DropdownMenu, Icon, MenuItem, Text, Theme, Tooltip, useThemes } from "xmlui";
import styles from "./ThemeSwitcher.module.scss";

export const ThemeSwitcher = forwardRef<HTMLButtonElement>(() => {
  const { appDescription, options, dispatch } = usePlayground();
  const { themes } = useThemes();

  return (
    <Tooltip text="Change theme">
      <DropdownMenu
        triggerTemplate={<Button variant="ghost" size="sm" icon={<MdOutlinePalette />} />}
      >
        <Text className={styles.sectionTitle} variant="strong">
          Themes
        </Text>
        {appDescription.availableThemes &&
          appDescription.availableThemes.length > 0 &&
          appDescription.availableThemes
            .filter(
              (theme) =>
                theme.id !== "xmlui-docs" && theme.id !== "xmlui-blog" && theme.id !== "xmlui-web",
            )
            .map((theme, index) => (
              <Theme
                key={index}
                id={!themes.find((t) => t.id === theme.id)?.id ? "xmlui" : theme.id}
                themeVars={{ "color-MenuItem": theme.color || "$color-primary-500" }}
              >
                <MenuItem
                  iconPosition="end"
                  icon={theme.id === options.activeTheme ? <Icon name="checkmark" /> : undefined}
                  key={index}
                  label={theme.id}
                  onClick={() => dispatch(activeThemeChanged(theme.id))}
                />
              </Theme>
            ))}
      </DropdownMenu>
    </Tooltip>
  );
});

ThemeSwitcher.displayName = "ThemeSwitcher";
