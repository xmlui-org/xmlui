import type React from "react";

import styles from "./Dialog.module.scss";

import { Text } from "../Text/TextNative";
import { ModalDialog } from "./ModalDialogNative";

export type Props = {
  title?: string;
  description?: string;
  isOpen?: boolean;
  onClose: () => (Promise<boolean | undefined | void> | boolean | undefined | void);
  buttons: React.ReactNode;
  // Accept any React component - provides a way to add custom content to the dialog,
  // like complex layouts, images, etc.
  children?: React.ReactNode;
  portalTo?: HTMLElement;
};

/**
 * Dialog component that is customizable with action buttons. The children prop accepts React elements.
 *
 * Note that clicking outside of the dialog or pressing Escape will call the onClose function.
 * Thus, if you want to stop that from firing, do so in the onClose function from outside.
 */
export const Dialog = ({
  title,
  description,
  children,
  isOpen,
  onClose,
  buttons,
}: Props) => {
  return (
    <ModalDialog onClose={onClose} isInitiallyOpen={isOpen} title={title}>
      <div className={styles.dialogContent}>
        <div id="dialogDesc">
          <Text>{description}</Text>
        </div>
        {children}
      </div>
      {!!buttons && <footer className={styles.dialogActions}>{buttons}</footer>}
    </ModalDialog>
  );
};
