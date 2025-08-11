import React, { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";
import * as Dialog from "@radix-ui/react-dialog";

import styles from "./ModalDialog.module.scss";
import { Button, Icon, useTheme } from "xmlui";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "./Tooltip";

// =====================================================================================================================
// React component definition

type ModalProps = {
  style?: CSSProperties;
  children?: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  popupPlayground: () => void;
  clickPosition: { x: number; y: number };
};

const overlayVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const contentVariants = {
  initial: (custom: { x: number; y: number }) => ({
    opacity: 0,
    scale: 0.2,
    x: custom.x - window.innerWidth / 2,
    y: custom.y - window.innerHeight / 2,
  }),
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.2,
    transition: { duration: 0.2 },
  },
};

function durationToSeconds(durationString?: string) {
  if (!durationString) {
    return undefined;
  }
  const trimmedString = durationString.trim();

  if (trimmedString.endsWith("ms")) {
    const milliseconds = parseFloat(trimmedString);
    return milliseconds / 1000;
  } else if (trimmedString.endsWith("s")) {
    return parseFloat(trimmedString);
  } else {
    return parseFloat(trimmedString);
  }
}

export const ModalDialog = React.forwardRef(
  ({ children, style, isOpen, setIsOpen, popupPlayground, clickPosition }: ModalProps, ref) => {
    const { root, getThemeVar } = useTheme();
    const modalRef = useRef<HTMLDivElement>(null);
    const composedRef = ref ? composeRefs(ref, modalRef) : modalRef;
    const [rendered, setRendered] = useState(true);

    useEffect(() => {
      if (isOpen) {
        modalRef.current?.focus();
      }
    }, [isOpen]);

    // https://github.com/radix-ui/primitives/issues/2122#issuecomment-2140827998
    useEffect(() => {
      if (isOpen) {
        // Pushing the change to the end of the call stack
        const timer = setTimeout(() => {
          document.body.style.pointerEvents = "";
        }, 0);

        return () => clearTimeout(timer);
      } else {
        document.body.style.pointerEvents = "auto";
      }
    }, [isOpen]);

    if (!root) {
      return null;
    }

    const onExitComplete = () => {
      setIsOpen(false);
    };

    return (
      <Dialog.Root defaultOpen={false} open={isOpen} onOpenChange={setRendered}>
        <Dialog.Portal container={root}>
          <AnimatePresence onExitComplete={onExitComplete}>
            {rendered && (
              <Dialog.Overlay className={styles.overlay} forceMount>
                <motion.div
                  key="overlay"
                  className={styles.overlayBg}
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{
                    duration: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
                <motion.div
                  className={styles.contentWrapper}
                  variants={contentVariants}
                  custom={{ x: clickPosition.x, y: clickPosition.y }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{
                    duration:
                      durationToSeconds(getThemeVar("duration-startAnimation-ModalDialog")) || 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Dialog.Content
                    className={classnames(styles.content)}
                    forceMount
                    onPointerDownOutside={(event) => {
                      if (
                        event.target instanceof Element &&
                        event.target.closest("._debug-inspect-button") !== null
                      ) {
                        //we prevent the auto modal close on clicking the inspect button
                        event.preventDefault();
                      }
                    }}
                    ref={composedRef}
                    style={{ ...style, gap: undefined }}
                  >
                    <Dialog.Title style={{ marginTop: 0 }}>
                      <header id="dialogTitle" className={styles.dialogTitle}>
                        <div className={styles.header}>
                          <Button variant={"ghost"} size={"sm"}>
                            Code
                          </Button>
                          <div className={styles.actions}>
                            <Tooltip label={"View and edit in new full-width window"}>
                              <Button
                                onClick={popupPlayground}
                                size={"xs"}
                                variant={"ghost"}
                                icon={<Icon name={"new-window"} />}
                              />
                            </Tooltip>
                            <Tooltip label={"Close DevTools"}>
                              <Button
                                onClick={() => setRendered(false)}
                                size={"xs"}
                                variant={"ghost"}
                                icon={<Icon name={"close"} />}
                              />
                            </Tooltip>
                          </div>
                        </div>
                      </header>
                    </Dialog.Title>
                    <div className={styles.innerContent} style={{ gap: style?.gap }}>
                      {children}
                    </div>
                  </Dialog.Content>
                </motion.div>
              </Dialog.Overlay>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
);

ModalDialog.displayName = "ModalDialog";
