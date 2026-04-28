import type { CSSProperties, ReactNode } from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import classnames from "classnames";
import styles from "./Share.module.scss";

export const defaultProps = {
  label: "Copy & share",
  copyLabel: "Copy page",
  copyDescription: "Copy page as markdown for LLMs",
  copiedLabel: "Copied!",
  chatGptLabel: "Open in ChatGPT",
  chatGptDescription: "Ask questions about this page",
  claudeLabel: "Open in Claude",
  claudeDescription: "Ask questions about this page",
  twitterLabel: "Share in X (Twitter)",
  twitterDescription: "Start conversation",
  linkedInLabel: "Share in LinkedIn",
  linkedInDescription: "Start conversation",
  showCopy: true,
  showChatGpt: true,
  showClaude: true,
  showTwitter: true,
  showLinkedIn: true,
};

type Props = {
  label?: string;
  pageUrl?: string;
  pageTitle?: string;
  markdownContent?: string;
  copyLabel?: string;
  copyDescription?: string;
  copiedLabel?: string;
  chatGptLabel?: string;
  chatGptDescription?: string;
  claudeLabel?: string;
  claudeDescription?: string;
  twitterLabel?: string;
  twitterDescription?: string;
  linkedInLabel?: string;
  linkedInDescription?: string;
  showCopy?: boolean;
  showChatGpt?: boolean;
  showClaude?: boolean;
  showTwitter?: boolean;
  showLinkedIn?: boolean;
  className?: string;
  style?: CSSProperties;
};

function getCurrentUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function getCurrentTitle(): string {
  if (typeof document === "undefined") return "";
  return document.title || "";
}

function buildLlmPrompt(url: string): string {
  return `Read ${url} so I can ask questions about it.`;
}

const ChevronDownIcon = (props: { className?: string }) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CopyIcon = (props: { className?: string }) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ExternalLinkIcon = (props: { className?: string }) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const ShareIcon = (props: { className?: string }) => (
  <svg
    className={props.className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

type ShareItem = {
  key: string;
  label: string;
  description?: string;
  icon: ReactNode;
  trailingIcon?: ReactNode;
  onSelect: () => void | Promise<void>;
  testId: string;
};

export const Share = memo(function Share({
  label = defaultProps.label,
  pageUrl,
  pageTitle,
  markdownContent,
  copyLabel = defaultProps.copyLabel,
  copyDescription = defaultProps.copyDescription,
  copiedLabel = defaultProps.copiedLabel,
  chatGptLabel = defaultProps.chatGptLabel,
  chatGptDescription = defaultProps.chatGptDescription,
  claudeLabel = defaultProps.claudeLabel,
  claudeDescription = defaultProps.claudeDescription,
  twitterLabel = defaultProps.twitterLabel,
  twitterDescription = defaultProps.twitterDescription,
  linkedInLabel = defaultProps.linkedInLabel,
  linkedInDescription = defaultProps.linkedInDescription,
  showCopy = defaultProps.showCopy,
  showChatGpt = defaultProps.showChatGpt,
  showClaude = defaultProps.showClaude,
  showTwitter = defaultProps.showTwitter,
  showLinkedIn = defaultProps.showLinkedIn,
  className,
  style,
}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolveUrl = useCallback(() => {
    const value = pageUrl?.trim();
    return value && value.length > 0 ? value : getCurrentUrl();
  }, [pageUrl]);

  const resolveTitle = useCallback(() => {
    const value = pageTitle?.trim();
    return value && value.length > 0 ? value : getCurrentTitle();
  }, [pageTitle]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const text = markdownContent ?? "";
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [markdownContent]);

  const handleOpenInChatGpt = useCallback(() => {
    const url = resolveUrl();
    const target = `https://chatgpt.com/?hints=search&q=${encodeURIComponent(buildLlmPrompt(url))}`;
    window.open(target, "_blank", "noopener,noreferrer");
    setOpen(false);
  }, [resolveUrl]);

  const handleOpenInClaude = useCallback(() => {
    const url = resolveUrl();
    const target = `https://claude.ai/new?q=${encodeURIComponent(buildLlmPrompt(url))}`;
    window.open(target, "_blank", "noopener,noreferrer");
    setOpen(false);
  }, [resolveUrl]);

  const handleShareInTwitter = useCallback(() => {
    const url = resolveUrl();
    const title = resolveTitle();
    const target = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url,
    )}&text=${encodeURIComponent(title)}`;
    window.open(target, "_blank", "noopener,noreferrer");
    setOpen(false);
  }, [resolveTitle, resolveUrl]);

  const handleShareInLinkedIn = useCallback(() => {
    const url = resolveUrl();
    const title = resolveTitle();
    const text = title ? `${title}\n\n${url}` : url;
    const target = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(target, "_blank", "noopener,noreferrer");
    setOpen(false);
  }, [resolveTitle, resolveUrl]);

  const items = useMemo<ShareItem[]>(() => {
    const list: ShareItem[] = [];
    if (showCopy) {
      list.push({
        key: "copy",
        label: copied ? copiedLabel : copyLabel,
        description: copyDescription,
        icon: <CopyIcon className={styles.itemHeaderIcon} />,
        onSelect: handleCopy,
        testId: "share-copy",
      });
    }
    if (showChatGpt) {
      list.push({
        key: "chatgpt",
        label: chatGptLabel,
        description: chatGptDescription,
        icon: null,
        trailingIcon: <ExternalLinkIcon className={styles.itemHeaderTrailingIcon} />,
        onSelect: handleOpenInChatGpt,
        testId: "share-chatgpt",
      });
    }
    if (showClaude) {
      list.push({
        key: "claude",
        label: claudeLabel,
        description: claudeDescription,
        icon: null,
        trailingIcon: <ExternalLinkIcon className={styles.itemHeaderTrailingIcon} />,
        onSelect: handleOpenInClaude,
        testId: "share-claude",
      });
    }
    if (showTwitter) {
      list.push({
        key: "twitter",
        label: twitterLabel,
        description: twitterDescription,
        icon: null,
        trailingIcon: <ShareIcon className={styles.itemHeaderTrailingIcon} />,
        onSelect: handleShareInTwitter,
        testId: "share-twitter",
      });
    }
    if (showLinkedIn) {
      list.push({
        key: "linkedin",
        label: linkedInLabel,
        description: linkedInDescription,
        icon: null,
        trailingIcon: <ShareIcon className={styles.itemHeaderTrailingIcon} />,
        onSelect: handleShareInLinkedIn,
        testId: "share-linkedin",
      });
    }
    return list;
  }, [
    chatGptDescription,
    chatGptLabel,
    claudeDescription,
    claudeLabel,
    copied,
    copiedLabel,
    copyDescription,
    copyLabel,
    handleCopy,
    handleOpenInChatGpt,
    handleOpenInClaude,
    handleShareInLinkedIn,
    handleShareInTwitter,
    linkedInDescription,
    linkedInLabel,
    showChatGpt,
    showClaude,
    showCopy,
    showLinkedIn,
    showTwitter,
    twitterDescription,
    twitterLabel,
  ]);

  if (items.length === 0) return null;

  return (
    <div
      className={classnames("xmlui-share", styles.root, className)}
      style={style}
      ref={rootRef}
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="share-trigger"
      >
        <span>{label}</span>
        <ChevronDownIcon
          className={classnames(styles.triggerIcon, open && styles.triggerIconOpen)}
        />
      </button>
      {open && (
        <div role="menu" className={styles.menu} data-testid="share-menu">
          {items.map((item) => (
            <button
              key={item.key}
              role="menuitem"
              type="button"
              className={styles.item}
              onClick={() => item.onSelect()}
              data-testid={item.testId}
            >
              <span className={styles.itemHeader}>
                {item.icon}
                <span>{item.label}</span>
                {item.trailingIcon}
              </span>
              {item.description && (
                <span className={styles.itemSecondary}>{item.description}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
