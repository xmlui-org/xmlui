import type { ThemeDefinition } from "xmlui";

export const XmluiBlogAuraThemeDefinition: ThemeDefinition = {
  name: "XMLUI Blog Aura Theme",
  id: "xmlui-blog-aura",
  extends: "xmlui-blog",
  color: "$color-primary-500",
  themeVars: {
    // --- Blog layout config
    layout: "featuredWithTabs",
    tableOfContents: "true",
    tags: "true",

    // --- App layout
    "maxWidth-content-App": "800px",
    "maxWidth-content-App--withToc": "1000px",

    // --- Fundamental colors & typography
    "color-surface": "rgb(111, 110, 119)",
    backgroundColor: "$color-surface-0",
    fontSize: "14px",
    "fontWeight-Text": "400",
    "fontWeight-bold": "700",
    "textColor-primary": "$color-surface-800",
    "textColor-NavLink--active": "$color-primary",
    "fontSize-Text-info": "14px",
    "textColor-Text-info": "$color-primary-500",
    "textColor-Text-info--hover": "$color-primary-500",
    "textColor-Text-infoStrong": "$color-primary-500",
    "textColor-Text-description": "$color-surface-800",
    "textColor-Text-description--hover": "$color-surface-800",
    "fontSize-Text-description": "18px",
    "fontWeight-Text-description": "500",
    "textColor-Text-blurb": "$color-surface-800",
    "textColor-Text-blurb--hover": "$color-surface-800",
    "textColor-Text": "$color-surface-800",
    "textColor-H2": "$color-surface-800",
    "textColor-H1": "$color-surface-800",
    "fontWeight-Link--active": "normal",
    "textDecorationLine-Link": "none",
    "textColor-Link--active": "$color-primary-500",

    // --- Blog component customization tokens
    "fontSize-blog-overview-title": "42px",
    "fontSize-blog-overview-post-title": "24px",
    "fontSize-blog-overview-featured-title": "24px",
    "fontSize-blog-page-title": "32px",
    "minHeight-blog-featured-grid-card": "320px",
    "marginTop-blog-tabs-content": "$space-6",
    "border-blog-grid-top": "1px solid $color-surface-200",
    "border-blog-grid-left": "1px solid $color-surface-200",
    "border-blog-grid-right": "1px solid $color-surface-200",
    "border-blog-grid-bottom": "1px solid $color-surface-200",

    // --- Blog text variants
    "fontSize-Text-blogPostDescription": "24px",
    "textColor-Text-blogPostDescription": "$color-surface-800",
    "fontWeight-Text-blogPostDescription": "500",
    "backgroundColor-Text-tagPill": "$color-surface-100",
    "textColor-Text-tagPill": "$color-surface-500",
    "borderRadius-Text-tagPill": "$space-8",
    "paddingHorizontal-Text-tagPill": "$space-3",
    "paddingVertical-Text-tagPill": "$space-0_5",
  },
};

export default XmluiBlogAuraThemeDefinition;
