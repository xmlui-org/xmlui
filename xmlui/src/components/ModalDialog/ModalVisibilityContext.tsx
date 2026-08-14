import React, { useCallback, useContext, useEffect, useId } from "react";

interface IModalVisibilityContext {
  registerForm: (id: string) => void;
  unRegisterForm: (id: string) => void;
  setFormDirty: (id: string, dirty: boolean) => void;
  amITheSingleForm: (id: string) => boolean;
  requestClose: () => Promise<void>;
}

export const ModalVisibilityContext = React.createContext<IModalVisibilityContext | null>(null);

export const useModalFormClose = () => {
  const id = useId();
  const { registerForm, unRegisterForm, requestClose, amITheSingleForm, setFormDirty } =
    useContext(ModalVisibilityContext) || {};

  useEffect(() => {
    if (registerForm) {
      registerForm(id);
      return () => {
        unRegisterForm?.(id);
      };
    }
  }, [id, registerForm, unRegisterForm]);

  return {
    requestClose: useCallback(() => {
      if (!requestClose) {
        return;
      }
      if (!amITheSingleForm?.(id)) {
        return;
      }
      return requestClose();
    }, [amITheSingleForm, id, requestClose]),
    setDirty: useCallback(
      (dirty: boolean) => {
        setFormDirty?.(id, dirty);
      },
      [id, setFormDirty],
    ),
  };
};
