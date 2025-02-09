import React, { useCallback, useContext, useEffect, useId } from "react";

interface IModalVisibilityContext {
  registerForm: (id: string) => void;
  unRegisterForm: (id: string) => void;
  amITheSingleForm: (id: string) => boolean;
  requestClose: () => Promise<void>;
}

export const ModalVisibilityContext = React.createContext<IModalVisibilityContext | null>(null);

export const useModalFormClose = () => {
  const id = useId();
  const { registerForm, unRegisterForm, requestClose, amITheSingleForm } =
    useContext(ModalVisibilityContext) || {};

  useEffect(() => {
    if (registerForm) {
      registerForm(id);
      return () => {
        unRegisterForm?.(id);
      };
    }
  }, [id, registerForm, unRegisterForm]);

  return useCallback(() => {
    if (!requestClose) {
      return;
    }
    if (!amITheSingleForm(id)) {
      return;
    }
    return requestClose();
  }, [amITheSingleForm, id, requestClose]);
};
