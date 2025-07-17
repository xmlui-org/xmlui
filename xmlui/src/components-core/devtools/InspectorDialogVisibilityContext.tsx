import React from "react";

interface IModalVisibilityContext {
  requestClose: () => Promise<void>;
}

export const InspectorDialogVisibilityContext = React.createContext<IModalVisibilityContext | null>(null);
