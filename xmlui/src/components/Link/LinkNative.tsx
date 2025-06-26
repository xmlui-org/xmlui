import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type HTMLAttributeReferrerPolicy,
  type ReactNode,
  useMemo,
  useCallback,
} from "react";
import { Link } from "@remix-run/react";
import classnames from "classnames";

import styles from "./Link.module.scss";

import type { LinkTarget } from "../abstractions";
import { createUrlWithQueryParams } from "../component-utils";
import { Icon } from "../Icon/IconNative";
import type { To } from "react-router-dom";

// =====================================================================================================================
// React Link component implementation

type Props = {
  to: string | { pathname: string; queryParams?: Record<string, any> };
  children: ReactNode;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
} & Partial<
  Pick<
    HTMLAnchorElement,
    "hreflang" | "rel" | "download" | "target" | "referrerPolicy" | "ping" | "type"
  >
>;

export const defaultProps: Pick<Props, "active" | "disabled"> = {
  active: false,
  disabled: false,
};

export const LinkNative = forwardRef(function LinkNative(
  props: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { to, children, icon, active = defaultProps.active, onClick, target, disabled = defaultProps.disabled, style, ...anchorProps } =
    specifyTypes(props);

  const iconLink = !!icon && !children;
  const smartTo = useMemo(() => {
    return createUrlWithQueryParams(to);
  }, [to]) as To;

  const Node = !to ? "div" : Link;
  
  // For hash links, we'll use a regular anchor tag to avoid React Router interference
  const isHashLink = typeof to === 'string' && to.startsWith('#');
  const FinalNode = isHashLink ? "a" : Node;

  // Handle hash navigation for same-page scrolling
  const handleClick = useCallback((event: React.MouseEvent) => {
    const toUrl = typeof to === 'string' ? to : to?.pathname;
    
    // Check if this is a hash link (starts with #)
    if (toUrl && toUrl.startsWith('#')) {
      const targetId = toUrl.substring(1);
      const currentHash = window.location.hash;
      
      // Always prevent default for hash links and handle manually
      event.preventDefault();
      
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView();
        
        // Build the new URL with existing hash route + fragment
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.split('#')[0]; // Get everything before the first #
        const existingHash = window.location.hash; // Current hash (e.g., #/about)
        
        let newUrl: string | URL;
        if (existingHash && existingHash !== toUrl) {
          // If there's an existing hash route, append the fragment to it
          if (existingHash.includes('/#')) {
            // Remove any existing fragment and add the new one
            const hashRoute = existingHash.split('/#')[0];
            newUrl = `${baseUrl}${hashRoute}/${toUrl}`;
          } else {
            // Just append the fragment to the existing hash
            newUrl = `${baseUrl}${existingHash}/${toUrl}`;
          }
        } else {
          // No existing hash or same fragment, just use the fragment
          newUrl = `${baseUrl}${toUrl}`;
        }
        
        window.history.pushState(null, '', newUrl);
      }
      
      // Call the original onClick if provided
      onClick?.();
      return;
    }
    
    // For all other cases, call the original onClick
    onClick?.();
  }, [to, onClick]);

  return (
    <FinalNode
      ref={forwardedRef as any}
      to={isHashLink ? undefined : smartTo}
      href={isHashLink ? to as string : undefined}
      style={style}
      target={target}
      onClick={handleClick}
      className={classnames(styles.container, {
        [styles.iconLink]: iconLink,
        [styles.active]: active,
        [styles.disabled]: disabled,
      })}
      {...anchorProps}
    >
      {icon && (
        <div className={styles.iconWrapper}>
          <Icon name={icon} />
        </div>
      )}
      {children}
    </FinalNode>
  );
});

/**
 * Converts generic types to more specific ones.
 */
function specifyTypes(props: Props) {
  const { target, referrerPolicy } = props;
  return {
    ...props,
    target: target as LinkTarget,
    referrerPolicy: referrerPolicy as HTMLAttributeReferrerPolicy,
  };
}
