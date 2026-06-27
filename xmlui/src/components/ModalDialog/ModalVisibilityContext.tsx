import React, { useCallback, useContext, useEffect, useId } from "react";

type ModalVisibilityContextValue = {
  registerForm: (id: string) => void;
  unRegisterForm: (id: string) => void;
  amITheSingleForm: (id: string) => boolean;
  requestClose: () => void | Promise<void>;
};

export const ModalVisibilityContext =
  React.createContext<ModalVisibilityContextValue | null>(null);

export function useModalFormClose() {
  const id = useId();
  const context = useContext(ModalVisibilityContext);

  useEffect(() => {
    if (!context) {
      return;
    }
    context.registerForm(id);
    return () => context.unRegisterForm(id);
  }, [context, id]);

  return useCallback(() => {
    if (!context || !context.amITheSingleForm(id)) {
      return;
    }
    return context.requestClose();
  }, [context, id]);
}
