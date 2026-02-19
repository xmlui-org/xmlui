import type { ThemeDefinition } from "xmlui";

export const BlogCustom: ThemeDefinition = {
  name: "Customized Blog",
  id: "blog-custom",
  extends: ["xmlui-blog"],
  themeVars: { 
  "fontSize-H2":"$fontSize-2xl",
   "fontSize-H1":"$fontSize-4xl",
  "backgroundColor-Badge":"red",
  "borderRadius-Badge": "16px",
  "backgroundColor": "$color-surface-50",
  "textColor-Text-blog-attribution":"$color-primary-600",
  "textColor-H1-hero-title":"$color-primary-600",
  "borderRadius-Card": "8px" 
  },
};

export default BlogCustom;
