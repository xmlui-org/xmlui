import type { CSSProperties, ReactNode } from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import classnames from "classnames";
import { Icon } from "xmlui";
import styles from "./Share.module.scss";

export const defaultProps = {
  label: "Copy page",
  toggleAriaLabel: "Open share menu",
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
  toggleAriaLabel?: string;
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
  <Icon name="chevrondown" className={props.className} aria-hidden />
);

const CopyIcon = (props: { className?: string }) => (
  <Icon name="copy" className={props.className} aria-hidden />
);

const ExternalLinkIcon = (props: { className?: string }) => (
  <Icon name="hyperlink" className={props.className} aria-hidden />
);

const ShareIcon = (props: { className?: string }) => (
  <Icon name="share" className={props.className} aria-hidden />
);

type ShareItem = {
  key: string;
  label: string;
  description?: string;
  icon: ReactNode;
  trailingIcon?: ReactNode;
  onSelect: () => void | Promise<void>;
};

export const Share = memo(function Share({
  label = defaultProps.label,
  toggleAriaLabel = defaultProps.toggleAriaLabel,
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
      <div className={styles.triggerGroup}>
        <button
          type="button"
          className={classnames(styles.trigger, styles.triggerPrimary)}
          onClick={handleCopy}
        >
          <CopyIcon className={styles.triggerLeadingIcon} />
          <span>{copied ? copiedLabel : label}</span>
        </button>
        <button
          type="button"
          className={classnames(styles.trigger, styles.triggerToggle)}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={toggleAriaLabel}
        >
          <ChevronDownIcon
            className={classnames(styles.triggerIcon, open && styles.triggerIconOpen)}
          />
        </button>
      </div>
      {open && (
        <div role="menu" className={styles.menu}>
          {items.map((item) => (
            <button
              key={item.key}
              role="menuitem"
              type="button"
              className={styles.item}
              onClick={() => item.onSelect()}
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
