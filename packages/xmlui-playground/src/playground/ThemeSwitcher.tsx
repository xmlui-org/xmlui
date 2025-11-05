import { usePlayground } from "../hooks/usePlayground";
import { MdOutlinePalette } from "react-icons/md";
import { activeThemeChanged } from "../state/store";
import { forwardRef } from "react";
import { Button, DropdownMenu, Icon, MenuItem, Text, Tooltip } from "xmlui";
import styles from "./ThemeSwitcher.module.scss";

export const ThemeSwitcher = forwardRef<HTMLButtonElement>(() => {
  const { appDescription, options, dispatch } = usePlayground();

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
          appDescription.availableThemes.map((theme, index) => (
            <MenuItem
              iconPosition="end"
              icon={theme.id === options.activeTheme ? <Icon name="checkmark" /> : undefined}
              key={index}
              label={theme.id}
              onClick={() => dispatch(activeThemeChanged(theme.id))}
            />
          ))}
      </DropdownMenu>
    </Tooltip>
  );
});

ThemeSwitcher.displayName = "ThemeSwitcher";
