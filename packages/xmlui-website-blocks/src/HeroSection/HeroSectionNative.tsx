import { forwardRef, ReactNode } from "react";
import { Button, Icon, Breakout } from "xmlui";

import styles from "./HeroSection.module.scss";

import classnames from "classnames";

const PART_HEADING_SECTION = "headingSection";
const PART_PREAMBLE = "preamble";
const PART_HEADLINE = "headline";
const PART_SUBHEADLINE = "subheadline";
const PART_MAIN_TEXT = "mainText";
const PART_CTA_BUTTON = "ctaButton";
const PART_IMAGE = "image";
const PART_BACKGROUND = "background";

type Props = {
  children?: ReactNode;
  backgroundTemplate?: ReactNode;
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
  imageWidth?: number | string;
  imageHeight?: number | string;
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
      backgroundTemplate,
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
      imageWidth,
      imageHeight,
      fullWidthBackground = defaultProps.fullWidthBackground,
      className,
      onCtaClick,
    }: Props,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const ctaButton = ctaButtonTemplate || (
      <Button
        data-part-id={PART_CTA_BUTTON}
        className={classnames(styles.ctaButton)}
        icon={ctaButtonIcon && <Icon name={ctaButtonIcon} aria-hidden />}
        onClick={onCtaClick}
      >
        {ctaButtonText}
      </Button>
    );

    const heroContent = (
      <div
        ref={ref}
        data-part-id={PART_BACKGROUND}
        className={classnames(styles.heroWrapper, className)}
      >
        {backgroundTemplate && (
          <div className={styles.backgroundTemplate}>{backgroundTemplate}</div>
        )}
        <div className={styles.heroContent}>
          <div
            data-part-id={PART_HEADING_SECTION}
            className={classnames(styles.headingSection, {
              [styles.start]: alignHeading === "start",
              [styles.center]: alignHeading === "center",
              [styles.end]: alignHeading === "end",
            })}
          >
            {preamble && (
              <div
                data-part-id={PART_PREAMBLE}
                className={classnames(
                  styles.preamble,
                  styles.preserveLinebreaks,
                )}
              >
                {preamble}
              </div>
            )}
            {headline && (
              <div
                data-part-id={PART_HEADLINE}
                className={classnames(
                  styles.headline,
                  styles.preserveLinebreaks,
                )}
              >
                {headline}
              </div>
            )}
            {subheadline && (
              <div
                data-part-id={PART_SUBHEADLINE}
                className={classnames(
                  styles.subheadline,
                  styles.preserveLinebreaks,
                )}
              >
                {subheadline}
              </div>
            )}
            {mainTextTemplate && (
              <div
                data-part-id={PART_MAIN_TEXT}
                className={classnames(
                  styles.textWrapper,
                  styles.preserveLinebreaks,
                )}
              >
                {mainTextTemplate}
              </div>
            )}
            {!mainTextTemplate && mainText && (
              <div
                data-part-id={PART_MAIN_TEXT}
                className={classnames(
                  styles.mainText,
                  styles.preserveLinebreaks,
                )}
              >
                {mainText}
              </div>
            )}
          </div>
          <div>{ctaButton}</div>
          {image && (
            <img
              data-part-id={PART_IMAGE}
              className={styles.image}
              src={image}
              style={{ width: imageWidth, height: imageHeight }}
              aria-hidden
            />
          )}
          {children}
        </div>
      </div>
    );

    return fullWidthBackground ? <Breakout>{heroContent}</Breakout> : heroContent;
  },
);
