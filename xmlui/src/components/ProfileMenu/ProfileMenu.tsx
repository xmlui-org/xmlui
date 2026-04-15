import styles from "./ProfileMenu.module.scss";

import { useThemes } from "../../components-core/theming/ThemeContext";
import { ThemedAvatar as Avatar } from "../Avatar/Avatar";
import { ThemedDropdownMenu as DropdownMenu, ThemedMenuItem as MenuItem, ThemedMenuSeparator as MenuSeparator } from "../DropdownMenu/DropdownMenu";

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
