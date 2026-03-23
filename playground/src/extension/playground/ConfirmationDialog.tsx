import * as AlertDialog from "@radix-ui/react-alert-dialog";
import styles from "./ConfirmationDialog.module.scss";
import classnames from "classnames";
import { useTheme } from "xmlui";

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}) => {
  const { root } = useTheme();
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal container={root}>
        <AlertDialog.Overlay className={styles.Overlay} />
        <AlertDialog.Content className={styles.Content}>
          <AlertDialog.Title className={styles.Title}>{title}</AlertDialog.Title>
          <AlertDialog.Description className={styles.Description}>
            {description}
          </AlertDialog.Description>
          <div className={styles.Actions}>
            <AlertDialog.Cancel asChild>
              <button className={classnames(styles.Button, styles.mauve)}>{cancelText}</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button className={classnames(styles.Button, styles.red)} onClick={onConfirm}>
                {confirmText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmationDialog;
