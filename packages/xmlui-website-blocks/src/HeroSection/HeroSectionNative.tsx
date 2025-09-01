import { forwardRef, ReactNode } from "react";
import { Button, Icon, partClassName } from "xmlui";

import styles from "./HeroSection.module.scss";

import classnames from "classnames";

const PART_HEADLINE = "headline";
const PART_SUBHEADLINE = "subheadline";
const PART_TEXT = "text";
const PART_CTA_BUTTON = "ctaButton";
const PART_MAIN = "main";
const PART_IMAGE = "image";
const PART_PRE_IMAGE = "preImage";
const PART_POST_IMAGE = "postImage";

type Props = {
  headline?: string;
  subheadline?: string;
  text?: string;
  textTemplate?: ReactNode;
  ctaButtonIcon?: string;
  ctaButtonText?: string;
  ctaButtonTemplate?: ReactNode;
  image?: string;
  preImageTemplate?: ReactNode;
  postImageTemplate?: ReactNode;
  heroTemplate?: ReactNode;
  breakout?: boolean;
  className?: string;
  onCtaClick?: () => void;
};

export const HeroSection = forwardRef(
  (
    {
      headline,
      subheadline,
      text,
      textTemplate,
      ctaButtonIcon,
      ctaButtonText,
      ctaButtonTemplate,
      image,
      preImageTemplate,
      postImageTemplate,
      heroTemplate,
      breakout,
      className,
      onCtaClick,
    }: Props,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const ctaButton = ctaButtonTemplate || (
      <Button
        className={classnames(partClassName(PART_CTA_BUTTON), styles.ctaButton)}
        icon={ctaButtonIcon && <Icon name={ctaButtonIcon} aria-hidden />}
        onClick={onCtaClick}
      >
        {ctaButtonText}
      </Button>
    );
    return (
      <div ref={ref} className={classnames(styles.heroWrapper, className)}>
        {headline && (
          <div className={classnames(partClassName(PART_HEADLINE), styles.headline)}>
            {headline}
          </div>
        )}
        {subheadline && (
          <div className={classnames(partClassName(PART_SUBHEADLINE), styles.subheadline)}>
            {subheadline}
          </div>
        )}
        {textTemplate && (
          <div className={classnames(partClassName(PART_TEXT), styles.textWrapper)}>
            {textTemplate}
          </div>
        )}
        {!textTemplate && text && (
          <div className={classnames(partClassName(PART_TEXT), styles.text)}>{text}</div>
        )}
        <div>{ctaButton}</div>
      </div>
    );
  },
);
