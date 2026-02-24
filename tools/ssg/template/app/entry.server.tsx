/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream, renderToString } from "react-dom/server";
import { StyleProvider, StyleRegistry } from "xmlui";

import vm from "node:vm";
import { scripts } from "./inline-scripts.js";

for (const script of scripts) {
  try {
    vm.runInThisContext(script);
  } catch (error) {
    console.error(
      `Error: Tried to execute inline script in non-browser environment, so that potential global functions and values would be available during static html generation. Encountered error, likely due to browser-specific APIs not being available in the script below:\n${script.substring(
        0,
        1000,
      )}`,
    );
    console.error(error);
  }
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
) {
  // Set global variable for XMLUI SSR location detection
  if (typeof globalThis !== "undefined") {
    const url = new URL(request.url);
    // Note: .hash will be empty because the server doesn't receive it.
    // This is susceptible to concurency issues, thus the generation should remain synchronous. can't start 2 requests, because they will modify this shared global state
    globalThis.location = url as unknown as Location;
  }
  //
  // 2. CREATE a new StyleRegistry instance for this specific server request.
  // This is crucial for isolating requests and preventing style leakage.
  const registry = new StyleRegistry();

  // 3. PROVIDE the per-request registry to the entire application tree.
  // Even though root.tsx also has a StyleProvider, our "smart" provider logic
  // will detect this parent provider and yield to it, ensuring all components
  // use this single server-side registry.
  const App = (
    <StyleProvider styleRegistry={registry}>
      <RemixServer context={remixContext} url={request.url} />
    </StyleProvider>
  );

  // 4. RENDER the application to a string. As React walks the component tree,
  // every <StyledBox> will register its styles with the registry we created above.
  const markup = renderToString(App);

  // 5. EXTRACT the collected CSS from the now-populated registry.
  const ssrStyles = registry.getSsrStyles();
  // NEW: Get all the unique style hashes that were rendered on the server.
  const ssrHashes = Array.from(registry.cache.keys()).join(",");

  // NEW: Get the classes from the registry after rendering.
  const htmlClasses = registry.getRootClasses();

  const finalMarkup = markup.replace(
    /<html([^>]*?)>/,
    (match: any, p1: any) => {
      // Check if the original <html> tag already has a class attribute
      const hasClass = /class="([^"]*)"/.exec(p1);

      if (hasClass) {
        // If a class exists, merge our classes with the existing ones.
        return `<html${p1.replace(/class="([^"]*)"/, `class="${hasClass[1]} ${htmlClasses}"`)}>`;
      } else {
        // If no class exists, add our new classes to the <html> tag.
        return `<html${p1} class="${htmlClasses}">`;
      }
    },
  );
  // 6. INJECT the styles into the final HTML document. We find the closing
  // </head> tag and insert our <style> tag right before it.
  const finalMarkupWithStyles = finalMarkup.replace(
    "</head>",
    `<style data-style-registry="true" data-ssr-hashes="${ssrHashes}">${ssrStyles}</style></head>`,
  );

  responseHeaders.set("Content-Type", "text/html");

  // 7. SEND the final, fully-styled HTML to the browser.
  return new Response("<!DOCTYPE html>" + finalMarkupWithStyles, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
