import styles from "./ProfileMenu.module.scss";

import { useThemes } from "../../components-core/theming/ThemeContext";
import { Avatar } from "../Avatar/AvatarNative";
import { DropdownMenu, MenuItem, MenuSeparator } from "../DropdownMenu/DropdownMenuNative";

// =====================================================================================================================
// Heading React component

type Props = {
  loggedInUser: any | null;
};

export const ProfileMenu = ({ loggedInUser }: Props) => {
  const { activeThemeId, setActiveThemeId } = useThemes();

  if (!loggedInUser) {
    return null;
  }
  const loggedInUserName = loggedInUser.name || loggedInUser.displayName;
  return (
    <DropdownMenu triggerTemplate={<Avatar url={loggedInUser.avatarUrl} name={loggedInUserName} size={"xs"} />}>
      <div className={styles.loggedInUserInfoWrapper}>
        <div className={styles.name}>{loggedInUserName}</div>
        <div className={styles.email}>{loggedInUser.email}</div>
      </div>
      <MenuSeparator />
      {activeThemeId.includes("dark") && <MenuItem onClick={() => setActiveThemeId(activeThemeId.replace("dark", "light"))}>Switch to light mode</MenuItem>}
      {activeThemeId.includes("light") && <MenuItem onClick={() => setActiveThemeId(activeThemeId.replace("light", "dark"))}>Switch to dark mode</MenuItem>}
      <MenuSeparator />
      <MenuItem>Log out</MenuItem>
    </DropdownMenu>
  );
};
