import { forwardRef, ReactNode } from "react";
import { Button, Icon, Breakout, useTheme } from "xmlui";

import styles from "./HeroSection.module.scss";

import classnames from "classnames";
import { Theme } from "xmlui";

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
  contentWidth?: string | number;
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
  fullWidthBackground?: boolean;
  className?: string;
  headerTone?: string;
  contentTone?: string;
  onCtaClick?: () => void;
};
export const defaultProps: Pick<
  Props,
  "fullWidthBackground" | "contentPlacement" | "contentAlignment" | "headerWidth" | "contentWidth"
> = {
  headerWidth: "50%",
  fullWidthBackground: true,
  contentPlacement: "bottom",
  contentAlignment: "center",
  contentWidth: "$maxWidth-content",
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
      contentWidth,
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
      headerTone,
      contentTone,
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
    const isHorizontal =
      effectiveContentPlacement === "left" || effectiveContentPlacement === "right";

    // Optional tone colors
    const { activeThemeTone } = useTheme();
    const effectiveTone = (prop?: string) => {
      switch (prop) {
        case "light":
        case "dark":
          return prop;
        case "reverse":
          return activeThemeTone === "light" ? "dark" : "light";
        default:
          return activeThemeTone;
      }
    };

    let effectiveHeaderTone = effectiveTone(headerTone);
    let effectiveContentTone = effectiveTone(contentTone);

    // Only render CTA button if there's content for it
    const ctaButton =
      (ctaButtonTemplate || ctaButtonText) &&
      (ctaButtonTemplate || (
        <Button
          data-part-id={PART_CTA_BUTTON}
          className={classnames(styles.ctaButton)}
          icon={ctaButtonIcon && <Icon name={ctaButtonIcon} aria-hidden />}
          onClick={onCtaClick}
        >
          {ctaButtonText}
        </Button>
      ));

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
        <Theme tone={effectiveHeaderTone}>
          <div
            data-part-id={PART_HEADING_SECTION}
            className={classnames(styles.headingSection, {
              [styles.start]: effectiveHeaderAlignment === "start",
              [styles.center]: effectiveHeaderAlignment === "center",
              [styles.end]: effectiveHeaderAlignment === "end",
            })}
          >
            {preamble && (
              <div data-part-id={PART_PREAMBLE} className={styles.preamble}>
                {preamble}
              </div>
            )}
            {headline && (
              <div data-part-id={PART_HEADLINE} className={styles.headline}>
                {headline}
              </div>
            )}
            {subheadline && (
              <div data-part-id={PART_SUBHEADLINE} className={styles.subheadline}>
                {subheadline}
              </div>
            )}
            {mainTextTemplate && (
              <div data-part-id={PART_MAIN_TEXT} className={styles.textWrapper}>
                {mainTextTemplate}
              </div>
            )}
            {!mainTextTemplate && mainText && (
              <div data-part-id={PART_MAIN_TEXT} className={styles.mainText}>
                {mainText}
              </div>
            )}
            {ctaButton && <div className={styles.ctaButtonWrapper}>{ctaButton}</div>}
          </div>
        </Theme>
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
        <Theme tone={effectiveContentTone}>
          <>
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
          </>
        </Theme>
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
          style={{ gap, width: contentWidth }}
        >
          {effectiveContentPlacement === "left" && contentSection}
          {headerSection}
          {(effectiveContentPlacement === "right" || effectiveContentPlacement === "bottom") &&
            contentSection}
        </div>
      </div>
    );

    return fullWidthBackground ? <Breakout>{heroContent}</Breakout> : heroContent;
  },
);
