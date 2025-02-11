import type { ComponentType, ReactNode } from "react";
import React from "react";

import type { Option } from "../abstractions";

const OptionTypeContext = React.createContext<ComponentType<Option>>(null);

export function useOptionType() {
  return React.useContext(OptionTypeContext);
}

function OptionTypeProvider({
  children,
  Component,
}: {
  children: ReactNode;
  Component: ComponentType<Option>;
}) {
  return <OptionTypeContext.Provider value={Component}>{children}</OptionTypeContext.Provider>;
}

export default OptionTypeProvider;
