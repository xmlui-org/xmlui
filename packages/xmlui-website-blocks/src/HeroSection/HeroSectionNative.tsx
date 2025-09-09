import { forwardRef, ReactNode } from "react";
import { Button, Icon, Breakout, partClassName } from "xmlui";

import styles from "./HeroSection.module.scss";

import classnames from "classnames";

const PART_HEADING_SECTION = "headingSection";
const PART_PREAMBLE = "preamble";
const PART_HEADLINE = "headline";
const PART_SUBHEADLINE = "subheadline";
const PART_TEXT = "text";
const PART_CTA_BUTTON = "ctaButton";
const PART_MAIN = "main";
const PART_IMAGE = "image";

type Props = {
  children?: ReactNode;
  alignHeading?: string;
  preamble?: string;
  headline?: string;
  subheadline?: string;
  mainText?: string;
  mainTextTemplate?: ReactNode;
  ctaButtonIcon?: string;
  ctaButtonText?: string;
  ctaButtonTemplate?: ReactNode;
  image?: string;
  preImageTemplate?: ReactNode;
  postImageTemplate?: ReactNode;
  fullWidthBackground?: boolean;
  className?: string;
  onCtaClick?: () => void;
};
export const defaultProps: Pick<Props, "fullWidthBackground" | "alignHeading"> = {
  alignHeading: "center",
  fullWidthBackground: true,
};

export const HeroSection = forwardRef(
  (
    {
      children,
      alignHeading = defaultProps.alignHeading,
      preamble,
      headline,
      subheadline,
      mainText,
      mainTextTemplate,
      ctaButtonIcon,
      ctaButtonText,
      ctaButtonTemplate,
      image,
      fullWidthBackground = defaultProps.fullWidthBackground,
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

    const heroContent = (
      <div ref={ref} className={classnames(styles.heroWrapper, className)}>
        <div
          className={classnames(partClassName(PART_HEADING_SECTION), styles.headingSection, {
            [styles.start]: alignHeading === "start",
            [styles.center]: alignHeading === "center",
            [styles.end]: alignHeading === "end",
          })}
        >
          {preamble && (
            <div
              className={classnames(
                partClassName(PART_PREAMBLE),
                styles.preamble,
                styles.preserveLinebreaks,
              )}
            >
              {preamble}
            </div>
          )}
          {headline && (
            <div
              className={classnames(
                partClassName(PART_HEADLINE),
                styles.headline,
                styles.preserveLinebreaks,
              )}
            >
              {headline}
            </div>
          )}
          {subheadline && (
            <div
              className={classnames(
                partClassName(PART_SUBHEADLINE),
                styles.subheadline,
                styles.preserveLinebreaks,
              )}
            >
              {subheadline}
            </div>
          )}
          {mainTextTemplate && (
            <div
              className={classnames(
                partClassName(PART_TEXT),
                styles.textWrapper,
                styles.preserveLinebreaks,
              )}
            >
              {mainTextTemplate}
            </div>
          )}
          {!mainTextTemplate && mainText && (
            <div
              className={classnames(
                partClassName(PART_TEXT),
                styles.mainText,
                styles.preserveLinebreaks,
              )}
            >
              {mainText}
            </div>
          )}
        </div>
        <div>{ctaButton}</div>
        {children}
      </div>
    );

    return fullWidthBackground ? <Breakout>{heroContent}</Breakout> : heroContent;
  },
);
