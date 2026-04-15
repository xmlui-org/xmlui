import { createContext, useContext } from "react";

import { EMPTY_OBJECT } from "./constants";

export type FnDeps = Record<string, string[]>;

const FnDepsContext = createContext<FnDeps>(EMPTY_OBJECT as FnDeps);

export const FnDepsProvider = FnDepsContext.Provider;

export function useFnDeps(): FnDeps {
  return useContext(FnDepsContext);
}
