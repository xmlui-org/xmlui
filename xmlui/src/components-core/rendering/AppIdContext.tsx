import { createContext, useContext } from "react";

/**
 * Context that provides a unique identifier for each AppRoot instance.
 * This enables components to determine which app instance they belong to,
 * which is particularly useful in nested app scenarios.
 */
export const AppIdContext = createContext<string | undefined>(undefined);

/**
 * React hook that returns the unique identifier of the current AppRoot instance.
 * 
 * @returns The unique app ID string, or undefined if called outside an AppRoot context
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const appId = useAppId();
 *   console.log(`This component belongs to app: ${appId}`);
 *   return <div>App ID: {appId}</div>;
 * }
 * ```
 */
export function useAppId(): string | undefined {
  return useContext(AppIdContext);
}
