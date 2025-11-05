import { usePlayground } from "../hooks/usePlayground";
import { MdOutlinePalette } from "react-icons/md";
import { activeThemeChanged } from "../state/store";
import { forwardRef } from "react";
import { Button, DropdownMenu, MenuItem } from "xmlui";

export const ThemeSwitcher = forwardRef<HTMLButtonElement>(() => {
  const { appDescription, dispatch } = usePlayground();

  return (
    <div>
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
    </div>
  );
});

ThemeSwitcher.displayName = "ThemeSwitcher";
