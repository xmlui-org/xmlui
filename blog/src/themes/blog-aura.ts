import type { ThemeDefinition } from "xmlui";

export const BlogAuraThemeDefinition: ThemeDefinition = {
  name: "Blog Aura Theme",
  id: "blog-aura",
  extends: "xmlui-blog",
  color: "$color-primary-500",
  themeVars: {
    // --- Blog layout config
    layout: "featuredWithTabs",
    tableOfContents: "false",
    tags: "true",

    // --- App layout
    "maxWidth-content-App": "1286px",
    "maxWidth-content-App--withToc": "1100px",

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
    "fontWeight-Link--active": "normal",
    "textDecorationLine-Link": "none",
    "textColor-Link--active": "$color-primary-500",


    "fontFamily-H1": "IBM Plex Mono",
    "fontFamily-H2": "IBM Plex Mono",
    "textColor-H1": "$color-primary-900",
    "textColor-H2": "$color-primary-900",
    "fontSize-H1": "2.625rem",
    "fontSize-H2": "1.5rem",
    "borderRadius-Card": "$space-7",
    "borderRadius-Image": "$space-4",
    "padding-Card": "$space-7",

    "backgroundColor-trigger-Tabs": "$color-surface-100",
    "backgroundColor-trigger-Tabs--hover": "$color-surface-100",
    "backgroundColor-trigger-Tabs--active": "$color-primary-900",
    "textColor-trigger-Tabs--active": "$color-surface-0",
    "textColor-trigger-Tabs": "$color-primary-900",
    "textColor-trigger-Tabs--hover": "$color-surface-400",
    "gap-list-Tabs": "$space-2",
    "borderRadius-trigger-Tabs": "24px",
    "padding-trigger-Tabs": "$space-4",
    "paddingVertical-trigger-Tabs": "$space-3",
    "backgroundColor-list-Tabs": "transparent",
    "borderWidth-Tabs": "0px",


    // --- Blog component customization tokens
    "fontSize-blog-overview-title": "42px",
    "fontSize-blog-overview-post-title": "24px",
    "fontSize-blog-overview-featured-title": "24px",
    "fontSize-blog-page-title": "32px",
    "minHeight-blog-featured-grid-card": "200px",
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

export default BlogAuraThemeDefinition;
