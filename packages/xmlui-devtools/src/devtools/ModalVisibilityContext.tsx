import React from "react";

interface IModalVisibilityContext {
  requestClose: () => Promise<void>;
}

export const ModalVisibilityContext = React.createContext<IModalVisibilityContext | null>(null);
