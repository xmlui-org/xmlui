# How XMLUI Prerendering Works

## 1. It's **NOT** Traditional Static Site Generation
The XMLUI docs site doesn't use traditional prerendering where each page becomes a separate HTML file.
Instead, it uses a **Single Page Application (SPA)** with static asset optimization.

---

## 2. The Build Process
**What happens:**
- Markdown files (`docs/public/pages/*.md`) are copied as-is to `dist/pages/`
- One main HTML file (`dist/index.html`) is generated
- JavaScript bundles are created and optimized
- CSS is extracted and optimized

---

## 3. File Structure After Build

```
dist/
├── index.html                    # Single HTML entry point
├── internal/
│   ├── index.iTF8U6-Y.js        # Main JS bundle (6.7MB!)
│   ├── index.BnuPjD5z.css        # CSS bundle (411KB)
│   └── chunks/                   # Code-split chunks
├── pages/                        # Raw markdown files
│   ├── build-hello-world-component.md
│   ├── app-structure.md
│   └── ...
└── resources/                    # Static assets
```

---

## 4. How Pages Are Served
**Client-Side Routing:**
- All routes go to `index.html` (SPA pattern)
- JavaScript handles routing to different pages
- Markdown files are loaded dynamically by the XMLUI engine

**Server Configuration:**
```json
// serve.json
{
  "rewrites": [
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
```

```xml
<!-- web.config (IIS) -->
<rule name="pushState" stopProcessing="true">
    <match url=".*" />
    <conditions>
        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
    </conditions>
    <action type="Rewrite" url="/" />
</rule>
```

---

## 5. The "Prerendering" Optimization
The optimization Gergo implemented is **not** about generating static HTML pages. It's about:

- **Function Inlining**: Moving JavaScript functions from modules into the HTML
- **Bundle Optimization**: Tree-shaking and code splitting
- **Asset Optimization**: CSS extraction, minification, compression

**What Google Sees:**
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- NO title, NO meta description, NO structured data -->
</head>
<body>
  <div id="root"></div>
  <!-- Empty div - no content visible to Google -->
  <script type="module" crossorigin src="/internal/index.L1FQigna.js"></script>
</body>
</html>
```

---

## 6. How Content is Actually Rendered
1. User visits `/build-hello-world-component`
2. SPA router handles the route
3. XMLUI engine loads `dist/pages/build-hello-world-component.md`
4. Markdown is parsed and rendered as React components
5. Functions are available immediately (inlined in HTML)

---

## 7. Performance Benefits
- **No server-side rendering**: Pure client-side SPA
- **Fast initial load**: Functions inlined, no module loading
- **Efficient caching**: Static assets can be cached aggressively
- **Code splitting**: Only load what's needed

---

## 8. React-Helmet and Dynamic Meta Tags

### **What is React-Helmet?**

**React-Helmet** is a library that allows you to manage your document head (the `<head>` section of your HTML) from React components. It's particularly useful for:

- Setting page titles dynamically
- Adding meta descriptions
- Including Open Graph tags
- Adding structured data
- Managing any `<head>` content from React

### **How It Works**

```tsx
import { Helmet } from "react-helmet-async";

function MyPage() {
  return (
    <>
      <Helmet>
        <title>My Page Title</title>
        <meta name="description" content="Page description" />
        <meta property="og:title" content="My Page Title" />
      </Helmet>
      <div>Page content...</div>
    </>
  );
}
```

### **XMLUI's Implementation**

XMLUI uses **react-helmet-async** (the newer, async version) in two ways:

#### **A. App-Level Title (AppNative.tsx)**
```tsx
// Sets the base title for the entire app
const memoizedHelmet = useMemo(
  () => name !== undefined ?
    <Helmet defaultTitle={name} titleTemplate={`%s | ${name}`} /> : null,
  [name],
);
```

This creates a title template like: `"Page Title | XMLUI"`

#### **B. Page-Level Title (PageMetaTitle Component)**
```tsx
// XMLUI component for setting page-specific titles
export const PageMetaTitle = ({ title = defaultProps.title }: { title: string }) => {
  return <Helmet title={title} />;
};
```

### **XMLUI Usage Example**

```xmlui
<PageMetaTitle value="Build a Hello World Component" />
```

This would set the browser tab title to: `"Build a Hello World Component | XMLUI"`

### **The Technical Process**

1. **Initial HTML Load:**
   ```html
   <head>
     <!-- No title or meta tags here -->
   </head>
   ```

2. **React Hydration:**
   ```tsx
   // React renders and Helmet adds tags
   <Helmet title="My Page" />
   ```

3. **Final DOM:**
   ```html
   <head>
     <title>My Page | XMLUI</title>
   </head>
   ```

### **The SEO Problem with React-Helmet**

While react-helmet is great for **client-side** title management, it has limitations for SEO:

#### **What Works:**
- ✅ Browser tab titles update dynamically
- ✅ Social media previews work (if JavaScript executes)
- ✅ User experience is improved

#### **What Doesn't Work for SEO:**
- ❌ **Google crawlers** may not execute JavaScript
- ❌ **Initial HTML** has no title/meta tags
- ❌ **Server-side rendering** doesn't include the tags
- ❌ **Social media crawlers** may not see the tags

### **Why XMLUI Uses It**

XMLUI uses react-helmet for:
- **Dynamic titles** based on current page
- **Better UX** (users see relevant page titles)
- **Social sharing** (when JavaScript works)
- **Consistent branding** (title template)

### **The Trade-off**

**Benefits:**
- Dynamic, context-aware titles
- Better user experience
- Works for social media (when JS executes)

**Limitations:**
- Doesn't help with SEO (Google crawlers)
- Requires JavaScript to work
- No server-side rendering support

---

## 9. SEO Implications

### **The SEO Problem**
The XMLUI docs site has a **significant SEO problem** because it's a pure SPA:

- **Single HTML File**: Only `index.html` exists
- **Client-Side Routing**: All navigation happens via JavaScript
- **Dynamic Content Loading**: Markdown files are loaded after page load
- **No Server-Side Rendering**: Content isn't pre-rendered as HTML

### **What Google Sees**
When Google crawls `https://xmlui.org/build-hello-world-component`, it gets:
- ✅ Basic HTML structure
- ❌ No page-specific title
- ❌ No meta description
- ❌ No content (empty `<div id="root">`)
- ❌ No structured data

### **Current SEO Solution (Limited)**
The site uses **react-helmet-async** for dynamic meta tags:

```tsx
// AppNative.tsx
const memoizedHelmet = useMemo(
  () => name !== undefined ?
    <Helmet defaultTitle={name} titleTemplate={`%s | ${name}`} /> : null,
  [name],
);
```

**But this has problems:**
1. **JavaScript Required**: Meta tags are set after React loads
2. **Google Doesn't Wait**: Google crawlers may not execute JavaScript
3. **No Page-Specific Content**: Only app-level title, no page-specific meta

### **What Would Solve the SEO Problem**
To make the site truly SEO-friendly, you'd need:

1. **Static Site Generation (SSG)**:
   ```bash
   # Generate static HTML for each page
   /build-hello-world-component.html
   /components-intro.html
   /tutorial-01.html
   ```

2. **Build-Time Meta Tag Generation**:
   ```html
   <title>Build a Hello World Component | XMLUI</title>
   <meta name="description" content="Learn how to create a complete React-based component for XMLUI...">
   ```

3. **Content Pre-rendering**:
   ```html
   <div id="root">
     <h1>Build a Hello World Component</h1>
     <p>This guide will walk you through creating...</p>
   </div>
   ```

4. **Structured Data**:
   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "HowTo",
     "name": "Build a Hello World Component"
   }
   </script>
   ```

### **The Trade-off**
This is a deliberate architectural choice:
- **SPA Benefits**: Fast navigation, rich interactions, single codebase
- **SEO Costs**: Poor search engine visibility, no social media previews

For a developer documentation site, this might be acceptable since:
- Users often arrive via direct links (GitHub, bookmarks)
- Search is less critical than for marketing sites
- The target audience (developers) can handle JavaScript-heavy sites

But it does mean the site won't rank well in Google for terms like "XMLUI tutorial" or "how to build XMLUI components".

---

## Summary
The XMLUI docs site uses **SPA prerendering**, not traditional static site generation. The "prerendering" optimization is about:

- **Inlining functions** in HTML for immediate availability
- **Optimizing bundles** for faster loading
- **Static asset optimization** for better caching

The actual page content (markdown) is **loaded dynamically** by the XMLUI engine, not pre-rendered as static HTML files. This gives you the performance benefits of static assets while maintaining the flexibility of a dynamic SPA.

**However**, this approach comes with significant SEO trade-offs, making the site less discoverable through search engines but more performant for direct users.
