import { memo } from "react";

import {
  DropdownMenuComponent,
  MenuItemComponent,
  MenuSeparatorComponent,
} from "../DropdownMenu/DropdownMenuReact";
import styles from "./ProfileMenu.module.scss";
import type { LoggedInUser } from "./ProfileMenuContext";

export type ProfileMenuProps = {
  loggedInUser: LoggedInUser;
};

export const ProfileMenu = memo(function ProfileMenu({ loggedInUser }: ProfileMenuProps) {
  if (!loggedInUser) {
    return null;
  }

  const displayName = loggedInUser.name || loggedInUser.displayName || loggedInUser.email || "";

  return (
    <DropdownMenuComponent
      alignment="end"
      triggerTemplate={<ProfileTrigger avatarUrl={loggedInUser.avatarUrl} name={displayName} />}
    >
      <div className={styles.loggedInUserInfoWrapper}>
        <div className={styles.name}>{displayName}</div>
        {loggedInUser.email ? <div className={styles.email}>{loggedInUser.email}</div> : null}
      </div>
      <MenuSeparatorComponent />
      <MenuItemComponent>Switch to dark mode</MenuItemComponent>
      <MenuSeparatorComponent />
      <MenuItemComponent>Log out</MenuItemComponent>
    </DropdownMenuComponent>
  );
});

function ProfileTrigger({ avatarUrl, name }: { avatarUrl?: string; name: string }) {
  return (
    <span aria-label={name ? `Profile menu for ${name}` : "Profile menu"} className={styles.trigger} role="button" tabIndex={0}>
      {avatarUrl ? (
        <img alt="" className={styles.avatar} src={avatarUrl} />
      ) : (
        initials(name)
      )}
    </span>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}
