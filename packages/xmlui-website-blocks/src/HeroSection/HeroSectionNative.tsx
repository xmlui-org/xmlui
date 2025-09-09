import { forwardRef, ReactNode } from "react";
import { Button, Icon, Breakout } from "xmlui";

import styles from "./HeroSection.module.scss";

import classnames from "classnames";

const PART_HEADER = "header";
const PART_CONTENT = "content";
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
  contentPlacement?: "left" | "right" | "bottom";
  contentAlignment?: "start" | "center" | "end";
  headerWidth?: string | number;
  gap?: string | number;
  headerAlignment?: string;
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
export const defaultProps: Pick<
  Props,
  "fullWidthBackground" | "contentPlacement" | "contentAlignment" | "headerWidth"
> = {
  headerWidth: "50%",
  fullWidthBackground: true,
  contentPlacement: "bottom",
  contentAlignment: "center",
};

export const HeroSection = forwardRef(
  (
    {
      children,
      backgroundTemplate,
      headerAlignment,
      contentPlacement = defaultProps.contentPlacement,
      contentAlignment = defaultProps.contentAlignment,
      headerWidth = defaultProps.headerWidth,
      gap,
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
    // Validate contentPlacement and default to "bottom" if invalid
    const validContentPlacements = ["left", "right", "bottom"] as const;
    const effectiveContentPlacement = validContentPlacements.includes(contentPlacement as any) 
      ? contentPlacement 
      : "bottom";

    // Default headerAlignment to "center" if not provided
    const effectiveHeaderAlignment = headerAlignment || "center";

    const isHorizontal = effectiveContentPlacement === "left" || effectiveContentPlacement === "right";

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

    // Header section (preamble to CTA button)
    const headerSection = (
      <div
        data-part-id={PART_HEADER}
        className={classnames(styles.header)}
        style={{
          width: isHorizontal ? headerWidth : undefined,
          flexShrink: isHorizontal ? 0 : undefined,
        }}
      >
        <div
          data-part-id={PART_HEADING_SECTION}
          className={classnames(styles.headingSection, {
            [styles.start]: effectiveHeaderAlignment === "start",
            [styles.center]: effectiveHeaderAlignment === "center",
            [styles.end]: effectiveHeaderAlignment === "end",
          })}
        >
          {preamble && (
            <div
              data-part-id={PART_PREAMBLE}
              className={classnames(styles.preamble, styles.preserveLinebreaks)}
            >
              {preamble}
            </div>
          )}
          {headline && (
            <div
              data-part-id={PART_HEADLINE}
              className={classnames(styles.headline, styles.preserveLinebreaks)}
            >
              {headline}
            </div>
          )}
          {subheadline && (
            <div
              data-part-id={PART_SUBHEADLINE}
              className={classnames(styles.subheadline, styles.preserveLinebreaks)}
            >
              {subheadline}
            </div>
          )}
          {mainTextTemplate && (
            <div
              data-part-id={PART_MAIN_TEXT}
              className={classnames(styles.textWrapper, styles.preserveLinebreaks)}
            >
              {mainTextTemplate}
            </div>
          )}
          {!mainTextTemplate && mainText && (
            <div
              data-part-id={PART_MAIN_TEXT}
              className={classnames(styles.mainText, styles.preserveLinebreaks)}
            >
              {mainText}
            </div>
          )}
          <div 
            className={classnames(styles.ctaButtonWrapper, {
              [styles.ctaStart]: effectiveHeaderAlignment === "start",
              [styles.ctaCenter]: effectiveHeaderAlignment === "center", 
              [styles.ctaEnd]: effectiveHeaderAlignment === "end",
            })}
          >
            {ctaButton}
          </div>
        </div>
      </div>
    );

    // Content section (image + children)
    const contentSection = (
      <div
        data-part-id={PART_CONTENT}
        className={classnames(styles.content, {
          [styles.contentStart]: contentAlignment === "start",
          [styles.contentCenter]: contentAlignment === "center",
          [styles.contentEnd]: contentAlignment === "end",
        })}
      >
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
        <div
          className={classnames(styles.heroContent, {
            [styles.horizontal]: isHorizontal,
            [styles.vertical]: !isHorizontal,
          })}
          style={{ gap }}
        >
          {effectiveContentPlacement === "left" && contentSection}
          {headerSection}
          {effectiveContentPlacement === "right" && contentSection}
          {effectiveContentPlacement === "bottom" && contentSection}
        </div>
      </div>
    );

    return fullWidthBackground ? <Breakout>{heroContent}</Breakout> : heroContent;
  },
);
