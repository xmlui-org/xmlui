import { usePlayground } from "../hooks/usePlayground";
import { MdOutlinePalette } from "react-icons/md";
import { activeThemeChanged } from "../state/store";
import { forwardRef } from "react";
import { Button, DropdownMenu, MenuItem, Tooltip } from "xmlui";

export const ThemeSwitcher = forwardRef<HTMLButtonElement>(() => {
  const { appDescription, dispatch } = usePlayground();

  return (
    <Tooltip text="Change theme">
      <DropdownMenu
        triggerTemplate={<Button variant="ghost" size="sm" icon={<MdOutlinePalette />} />}
      >
        {appDescription.availableThemes &&
          appDescription.availableThemes.length > 0 &&
          appDescription.availableThemes.map((theme, index) => (
            <MenuItem
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
