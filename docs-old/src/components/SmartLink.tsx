import Link, { type LinkProps } from "next/link";

type Props = {
  href: string;
  openInNewTab?: boolean;
} & LinkProps;

// This only works in Nextra because of the built-in Tailwind styling
const styles =
  "nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]";

export const SmartLink = ({ href, openInNewTab = false, ...props }: Props) => {
  const isInternalLink = href && (href.startsWith("/") || href.startsWith("#"));

  return isInternalLink ? (
    <Link
      className={styles}
      href={href}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      {...props}
    />
  ) : (
    <a
      className={styles}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  );
};
