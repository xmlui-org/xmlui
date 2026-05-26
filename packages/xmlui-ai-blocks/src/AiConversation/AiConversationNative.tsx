import { forwardRef, memo, type HTMLAttributes } from "react";
import styles from "./AiConversation.module.scss";

type Props = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  provider?: string;
  model?: string;
  status?: string;
  placeholder?: string;
};

export const defaultProps = {
  title: "AI conversation",
  provider: "Provider not connected",
  model: "Model not selected",
  status: "Placeholder",
  placeholder: "Conversation messages will appear here.",
};

export const AiConversation = memo(
  forwardRef<HTMLDivElement, Props>(function AiConversation(
    {
      title = defaultProps.title,
      provider = defaultProps.provider,
      model = defaultProps.model,
      status = defaultProps.status,
      placeholder = defaultProps.placeholder,
      className,
      ...rest
    },
    ref,
  ) {
    const rootClassName = className ? `${styles.root} ${className}` : styles.root;

    return (
      <section ref={ref} className={rootClassName} {...rest}>
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <div className={styles.title}>{title}</div>
            <div className={styles.meta}>
              <span>{provider}</span>
              <span className={styles.separator} aria-hidden="true" />
              <span>{model}</span>
            </div>
          </div>
          <span className={styles.status}>{status}</span>
        </header>

        <div className={styles.body}>
          <div className={styles.emptyState}>{placeholder}</div>
        </div>

        <footer className={styles.composer} aria-label="AI message composer placeholder">
          <div className={styles.composerInput}>Message composer placeholder</div>
          <button className={styles.sendButton} type="button" disabled>
            Send
          </button>
        </footer>
      </section>
    );
  }),
);
