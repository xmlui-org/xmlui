import { createContext, type ReactNode, useContext } from "react";

export type LoggedInUser = {
  avatarUrl?: string;
  displayName?: string;
  email?: string;
  name?: string;
} | null;

const ProfileMenuContext = createContext<LoggedInUser>(null);

export function ProfileMenuProvider({ children, loggedInUser }: { children: ReactNode; loggedInUser: LoggedInUser }) {
  return (
    <ProfileMenuContext.Provider value={loggedInUser}>
      {children}
    </ProfileMenuContext.Provider>
  );
}

export function useLoggedInUser(): LoggedInUser {
  return useContext(ProfileMenuContext);
}
