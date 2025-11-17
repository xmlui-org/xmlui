import { forwardRef, type ReactNode } from "react";
import { Button, Icon, Breakout, useTheme } from "xmlui";

import styles from "./HeroSection.module.scss";

import classnames from "classnames";
import { Theme } from "xmlui";
import { Part } from "../../../../xmlui/src/components/Part/Part";

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
        <Part partId={PART_CTA_BUTTON}>
          <Button
            className={classnames(styles.ctaButton)}
            icon={ctaButtonIcon && <Icon name={ctaButtonIcon} aria-hidden />}
            onClick={onCtaClick}
          >
            {ctaButtonText}
          </Button>
        </Part>
      ));

    // Header section (preamble to CTA button)
    const headerSection = (
      <Part partId={PART_HEADER}>
        <div
          className={classnames(styles.header)}
          style={{
            width: isHorizontal ? headerWidth : undefined,
            flexShrink: isHorizontal ? 0 : undefined,
          }}
        >
          <Theme tone={effectiveHeaderTone}>
            <Part partId={PART_HEADING_SECTION}>
              <div
                className={classnames(styles.headingSection, {
                  [styles.start]: effectiveHeaderAlignment === "start",
                  [styles.center]: effectiveHeaderAlignment === "center",
                  [styles.end]: effectiveHeaderAlignment === "end",
                })}
              >
                {preamble && (
                  <Part partId={PART_PREAMBLE}>
                    <div className={styles.preamble}>{preamble}</div>
                  </Part>
                )}
                {headline && (
                  <Part partId={PART_HEADLINE}>
                    <div className={styles.headline}>{headline}</div>
                  </Part>
                )}
                {subheadline && (
                  <Part partId={PART_SUBHEADLINE}>
                    <div className={styles.subheadline}>{subheadline}</div>
                  </Part>
                )}
                {mainTextTemplate && (
                  <Part partId={PART_MAIN_TEXT}>
                    <div className={styles.textWrapper}>{mainTextTemplate}</div>
                  </Part>
                )}
                {!mainTextTemplate && mainText && (
                  <Part partId={PART_MAIN_TEXT}>
                    <div className={styles.mainText}>{mainText}</div>
                  </Part>
                )}
                {ctaButton && <div className={styles.ctaButtonWrapper}>{ctaButton}</div>}
              </div>
            </Part>
          </Theme>
        </div>
      </Part>
    );

    // Content section (image + children)
    const contentSection = (
      <Part partId={PART_CONTENT}>
        <div
          className={classnames(styles.content, {
            [styles.contentStart]: contentAlignment === "start",
            [styles.contentCenter]: contentAlignment === "center",
            [styles.contentEnd]: contentAlignment === "end",
          })}
        >
          <Theme tone={effectiveContentTone}>
            <>
              {image && (
                <Part partId={PART_IMAGE}>
                  <img
                    className={styles.image}
                    src={image}
                    style={{ width: imageWidth, height: imageHeight }}
                    aria-hidden
                  />
                </Part>
              )}
              {children}
            </>
          </Theme>
        </div>
      </Part>
    );

    const heroContent = (
      <Part partId={PART_BACKGROUND}>
        <div ref={ref} className={classnames(styles.heroWrapper, className)}>
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
      </Part>
    );

    return fullWidthBackground ? <Breakout>{heroContent}</Breakout> : heroContent;
  },
);
