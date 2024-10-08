import Link, { LinkProps } from "next/link";

type Props = {
  href: string;
  openInNewTab?: boolean;
} & LinkProps;

// This only works in Nextra because of the built-in Tailwind styling
const styles =
  "nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]";

/**
 * Use it only for downloading local files from the docs site
 */
export const DownloadLink = ({ href, openInNewTab = false, ...props }: Props) => {
  const _href = `resources/files/${href}`;
  return (
    <Link
      className={styles}
      href={_href}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      download
      {...props}
    />
  );
};
