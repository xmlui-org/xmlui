import React, { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";
import * as Dialog from "@radix-ui/react-dialog";

import styles from "./InspectorDialog.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../theming/ThemeContext";

// =====================================================================================================================
// React component definition

const MotionContent = motion.create(Dialog.Content);

type ModalProps = {
  style?: CSSProperties;
  children?: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
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

export const InspectorDialog = React.forwardRef(
  (
    { children, style, isOpen, setIsOpen, clickPosition }: ModalProps,
    ref: React.Ref<HTMLDivElement>,
  ) => {
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
                <MotionContent
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
                >
                  <motion.div
                    ref={composedRef}
                    className={classnames(styles.content, styles.contentWrapper)}
                    variants={contentVariants}
                    custom={{ x: clickPosition.x, y: clickPosition.y }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                      duration:
                        durationToSeconds(getThemeVar("duration-startAnimation-ModalDialog")) ||
                        0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ ...style, gap: undefined }}
                  >
                    {children}
                  </motion.div>
                </MotionContent>
              </Dialog.Overlay>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
);

InspectorDialog.displayName = "InspectorDialog";
