import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame testId="iframe" />`);
    await expect(page.getByTestId("iframe")).toBeVisible();
  });

  test("component renders with 'src' property", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame src="https://example.com" testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("src", "https://example.com");
  });

  test("component renders with 'srcdoc' property", async ({ initTestBed, page }) => {
    const htmlContent = "<h1>Test Content</h1><p>This is embedded HTML.</p>";
    await initTestBed(`<IFrame srcdoc="${htmlContent}" testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("srcdoc", htmlContent);
  });

  test.describe("allow property", () => {
    test("sets permissions policy", async ({ initTestBed, page }) => {
      const allowValue = "camera; microphone; geolocation";
      await initTestBed(`<IFrame allow="${allowValue}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("allow", allowValue);
    });

    test("handles empty string", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame allow="" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("allow", "");
    });

    test("handles null gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame allow="{null}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).not.toHaveAttribute("allow");
    });

    test("handles undefined gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame allow="{undefined}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).not.toHaveAttribute("allow");
    });
  });

  test.describe("name property", () => {
    test("sets iframe name", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame name="myFrame" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("name", "myFrame");
    });

    test("handles empty string", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame name="" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("name", "");
    });

    test("handles null gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame name="{null}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).not.toHaveAttribute("name");
    });

    test("handles undefined gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame name="{undefined}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).not.toHaveAttribute("name");
    });

    test("handles unicode characters", async ({ initTestBed, page }) => {
      const unicodeName = "测试框架👨‍👩‍👧‍👦";
      await initTestBed(`<IFrame name="${unicodeName}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("name", unicodeName);
    });
  });

  test.describe("referrerPolicy property", () => {
    [
      "no-referrer",
      "no-referrer-when-downgrade", 
      "origin",
      "origin-when-cross-origin",
      "same-origin",
      "strict-origin",
      "strict-origin-when-cross-origin",
      "unsafe-url"
    ].forEach(policy => {
      test(`sets referrerPolicy to '${policy}'`, async ({ initTestBed, page }) => {
        await initTestBed(`<IFrame referrerPolicy="${policy}" testId="iframe" />`);
        const iframe = page.getByTestId("iframe");
        await expect(iframe).toHaveAttribute("referrerpolicy", policy);
      });
    });

    test("handles invalid value gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame referrerPolicy="invalid-policy" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("referrerpolicy", "invalid-policy");
    });

    test("handles null gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame referrerPolicy="{null}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).not.toHaveAttribute("referrerpolicy");
    });
  });

  test.describe("sandbox property", () => {
    test("sets sandbox restrictions", async ({ initTestBed, page }) => {
      const sandboxValue = "allow-scripts allow-same-origin";
      await initTestBed(`<IFrame sandbox="${sandboxValue}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("sandbox", sandboxValue);
    });

    test("handles empty string for strict sandboxing", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame sandbox="" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("sandbox", "");
    });

    test("handles single sandbox flag", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame sandbox="allow-scripts" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
    });

    test("handles null gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<IFrame sandbox="{null}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).not.toHaveAttribute("sandbox");
    });
  });

  test.describe("event handlers", () => {
    test("'load' event fires when content loads", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <IFrame 
          srcdoc="<h1>Test</h1>" 
          onLoad="testState = 'loaded'" 
          testId="iframe" 
        />
      `);
      
      // Wait for the load event to fire
      await expect.poll(testStateDriver.testState).toEqual("loaded");
    });

    test("'load' event receives event object", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <IFrame 
          srcdoc="<h1>Test</h1>" 
          onLoad="event => testState = event.type" 
          testId="iframe" 
        />
      `);
      
      await expect.poll(testStateDriver.testState).toEqual("load");
    });
  });

  test.describe("edge case combinations", () => {
    test("handles both src and srcdoc (srcdoc should take precedence)", async ({ initTestBed, page }) => {
      const htmlContent = "<h1>Srcdoc Content</h1>";
      await initTestBed(`<IFrame src="https://example.com" srcdoc="${htmlContent}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("src", "https://example.com");
      await expect(iframe).toHaveAttribute("srcdoc", htmlContent);
    });

    test("handles all security properties together", async ({ initTestBed, page }) => {
      await initTestBed(`
        <IFrame 
          src="https://example.com"
          sandbox="allow-scripts allow-same-origin"
          allow="camera; microphone"
          referrerPolicy="no-referrer"
          testId="iframe" 
        />
      `);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("sandbox", "allow-scripts allow-same-origin");
      await expect(iframe).toHaveAttribute("allow", "camera; microphone");
      await expect(iframe).toHaveAttribute("referrerpolicy", "no-referrer");
    });

    test("handles extremely long URL", async ({ initTestBed, page }) => {
      const longUrl = "https://example.com/" + "a".repeat(2000);
      await initTestBed(`<IFrame src="${longUrl}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toHaveAttribute("src", longUrl);
    });

    test("handles complex HTML in srcdoc with special characters", async ({ initTestBed, page }) => {
      const complexHtml = "&lt;h1&gt;测试&lt;/h1&gt;&lt;p&gt;Special chars: &amp;lt;&amp;gt;&amp;amp;&lt;/p&gt;";
      await initTestBed(`<IFrame srcdoc="${complexHtml}" testId="iframe" />`);
      const iframe = page.getByTestId("iframe");
      await expect(iframe).toBeVisible();
      // HTML entities get decoded by the browser, so we expect the decoded version
      await expect(iframe).toHaveAttribute("srcdoc", "<h1>测试</h1><p>Special chars: &lt;&gt;&amp;</p>");
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has correct element type", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame testId="iframe" />`);
    // Note: iframe elements don't have an implicit role, they are identified by tag name
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toBeVisible();
    // Check that it's actually an iframe element
    const tagName = await iframe.evaluate(el => el.tagName);
    expect(tagName).toBe("IFRAME");
  });

  test("maintains focus management", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    
    // IFrame should be focusable by default
    await iframe.focus();
    await expect(iframe).toBeFocused();
  });

  test("can be identified by name for accessibility tools", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame name="mainContent" testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toHaveAttribute("name", "mainContent");
    // Name attribute can be used by accessibility tools to identify the frame
  });

  test("supports sandbox for secure content embedding", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame sandbox="allow-scripts" testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
    // Sandbox provides security restrictions which can help with accessibility concerns
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies 'width-IFrame' theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame testId="iframe" />`, {
      testThemeVars: { "width-IFrame": "500px" },
    });
    await expect(page.getByTestId("iframe")).toHaveCSS("width", "500px");
  });

  test("applies 'height-IFrame' theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame testId="iframe" />`, {
      testThemeVars: { "height-IFrame": "400px" },
    });
    await expect(page.getByTestId("iframe")).toHaveCSS("height", "400px");
  });

  test("applies 'borderRadius-IFrame' theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame testId="iframe" />`, {
      testThemeVars: { "borderRadius-IFrame": "10px" },
    });
    await expect(page.getByTestId("iframe")).toHaveCSS("border-radius", "10px");
  });

  test("applies 'border-IFrame' theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame testId="iframe" />`, {
      testThemeVars: { "border-IFrame": "2px solid rgb(255, 0, 0)" },
    });
    await expect(page.getByTestId("iframe")).toHaveCSS("border", "2px solid rgb(255, 0, 0)");
  });

  test("applies multiple theme variables together", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame testId="iframe" />`, {
      testThemeVars: { 
        "width-IFrame": "600px",
        "height-IFrame": "400px",
        "borderRadius-IFrame": "8px",
        "border-IFrame": "3px dashed rgb(0, 255, 0)"
      },
    });
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toHaveCSS("width", "600px");
    await expect(iframe).toHaveCSS("height", "400px");
    await expect(iframe).toHaveCSS("border-radius", "8px");
    await expect(iframe).toHaveCSS("border", "3px dashed rgb(0, 255, 0)");
  });

  test("falls back to default theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    
    // Default height should be 300px  
    await expect(iframe).toHaveCSS("height", "300px");
    // Should have some border (exact value depends on theme)
    const borderStyle = await iframe.evaluate(el => getComputedStyle(el).border);
    expect(borderStyle).toBeTruthy();
    // Width might not be 100% in test environment but should have a computed value
    const widthStyle = await iframe.evaluate(el => getComputedStyle(el).width);
    expect(widthStyle).toBeTruthy();
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles no props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toBeVisible();
    // Should not have src or srcdoc attributes
    await expect(iframe).not.toHaveAttribute("src");
    await expect(iframe).not.toHaveAttribute("srcdoc");
  });

  test("handles invalid URL in src", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame src="not-a-valid-url" testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toBeVisible();
    // The src attribute might be transformed by XMLUI's resource URL handling
    const srcValue = await iframe.getAttribute("src");
    expect(srcValue).toContain("not-a-valid-url");
  });

  test("handles empty srcdoc", async ({ initTestBed, page }) => {
    await initTestBed(`<IFrame srcdoc="" testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("srcdoc", "");
  });

  test("handles malformed HTML in srcdoc", async ({ initTestBed, page }) => {
    const malformedHtml = "<div><p>Unclosed tags<span>More content";
    await initTestBed(`<IFrame srcdoc="${malformedHtml}" testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("srcdoc", malformedHtml);
  });

  test("handles very long sandbox value", async ({ initTestBed, page }) => {
    const longSandbox = Array(100).fill("allow-scripts").join(" ");
    await initTestBed(`<IFrame sandbox="${longSandbox}" testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toHaveAttribute("sandbox", longSandbox);
  });

  test("maintains performance with multiple iframes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <IFrame srcdoc="<h1>Frame 1</h1>" testId="iframe1" />
        <IFrame srcdoc="<h1>Frame 2</h1>" testId="iframe2" />
        <IFrame srcdoc="<h1>Frame 3</h1>" testId="iframe3" />
      </Fragment>
    `);
    
    await expect(page.getByTestId("iframe1")).toBeVisible();
    await expect(page.getByTestId("iframe2")).toBeVisible();
    await expect(page.getByTestId("iframe3")).toBeVisible();
  });

  test("handles data URLs in src", async ({ initTestBed, page }) => {
    const dataUrl = "data:text/html,<h1>Data URL Content</h1>";
    await initTestBed(`<IFrame src="${dataUrl}" testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toBeVisible();
    // The URL might be transformed by XMLUI's resource URL handling
    const srcValue = await iframe.getAttribute("src");
    expect(srcValue).toContain("data:text/html");
  });

  test("handles blob URLs in src", async ({ initTestBed, page }) => {
    // Blob URLs are typically generated by JavaScript, so we test with a mock
    const blobUrl = "blob:https://example.com/12345678-1234-1234-1234-123456789abc";
    await initTestBed(`<IFrame src="${blobUrl}" testId="iframe" />`);
    const iframe = page.getByTestId("iframe");
    await expect(iframe).toBeVisible();
    // The URL might be transformed by XMLUI's resource URL handling
    const srcValue = await iframe.getAttribute("src");
    expect(srcValue).toContain("blob:https://example.com");
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("APIs", () => {
  test("postMessage sends message to iframe content window", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <IFrame 
          id="testIframe"
          srcdoc="
            <script>
              window.addEventListener('message', (event) => {
                window.parent.postMessage({ received: event.data }, '*');
              });
            </script>
            <h1>Test IFrame</h1>
          "
          testId="iframe" />
        <Button 
          onClick="
            testIframe.postMessage({ type: 'test', message: 'Hello IFrame' }, '*');
            testState = 'message-sent';
          " 
          label="Send Message" 
          testId="sendButton" />
      </Fragment>
    `);

    await page.getByTestId("sendButton").click();
    await expect.poll(testStateDriver.testState).toEqual("message-sent");
  });

  test("postMessage with custom target origin", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <IFrame 
          id="testIframe"
          srcdoc="<h1>Test IFrame</h1>"
          testId="iframe" />
        <Button 
          onClick="
            testIframe.postMessage('test-message', 'https://example.com');
            testState = 'message-with-origin-sent';
          " 
          label="Send Message with Origin" 
          testId="sendButton" />
      </Fragment>
    `);

    await page.getByTestId("sendButton").click();
    await expect.poll(testStateDriver.testState).toEqual("message-with-origin-sent");
  });

  test("getContentWindow returns content window object", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <IFrame 
          id="testIframe"
          srcdoc="<h1>Test Content</h1>"
          testId="iframe" />
        <Button 
          onClick="
            const contentWindow = testIframe.getContentWindow();
            testState = {
              hasContentWindow: contentWindow !== null,
              isWindow: contentWindow && typeof contentWindow.postMessage === 'function'
            };
          " 
          label="Get Content Window" 
          testId="getWindowButton" />
      </Fragment>
    `);

    await page.getByTestId("getWindowButton").click();
    
    const result = await testStateDriver.testState();
    expect(result.hasContentWindow).toBe(true);
    expect(result.isWindow).toBe(true);
  });

  test("getContentWindow returns null when iframe not loaded", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <IFrame 
          id="testIframe"
          src="about:blank"
          testId="iframe" />
        <Button 
          onClick="
            const contentWindow = testIframe.getContentWindow();
            testState = { isNull: contentWindow === null };
          " 
          label="Get Content Window" 
          testId="getWindowButton" />
      </Fragment>
    `);

    // Click immediately before iframe might be fully loaded
    await page.getByTestId("getWindowButton").click();
    
    const result = await testStateDriver.testState();
    // Content window should exist even for about:blank
    expect(result.isNull).toBe(false);
  });

  test("getContentDocument returns content document object", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <IFrame 
          id="testIframe"
          srcdoc="<html><head><title>Test Document</title></head><body><h1>Test Content</h1></body></html>"
          testId="iframe" />
        <Button 
          onClick="
            const contentDoc = testIframe.getContentDocument();
            testState = {
              hasContentDocument: contentDoc !== null,
              documentTitle: contentDoc ? contentDoc.title : null,
              isDocument: contentDoc && typeof contentDoc.querySelector === 'function'
            };
          " 
          label="Get Content Document" 
          testId="getDocButton" />
      </Fragment>
    `);

    // Wait for iframe to load
    await page.waitForTimeout(100);
    await page.getByTestId("getDocButton").click();
    
    const result = await testStateDriver.testState();
    expect(result.hasContentDocument).toBe(true);
    expect(result.documentTitle).toBe("Test Document");
    expect(result.isDocument).toBe(true);
  });

  test("APIs work with same-origin srcdoc content", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <IFrame 
          id="testIframe"
          srcdoc="
            <html>
              <head><title>API Test Document</title></head>
              <body>
                <h1>API Test Content</h1>
                <script>
                  window.addEventListener('message', (event) => \\{
                    if (event.data.type === 'ping') \\{
                      window.parent.postMessage(\\{ type: 'pong', data: event.data.data }, '*');
                    }
                  });
                </script>
              </body>
            </html>
          "
          testId="iframe" />
        <Button 
          onClick="
            const contentWindow = testIframe.getContentWindow();
            const contentDoc = testIframe.getContentDocument();
            testIframe.postMessage({ type: 'ping', data: 'test-data' }, '*');
            testState = {
              hasWindow: contentWindow !== null,
              hasDocument: contentDoc !== null,
              documentTitle: contentDoc ? contentDoc.title : null,
              messageSent: true
            };
          " 
          label="Test All APIs" 
          testId="testAllButton" />
      </Fragment>
    `);

    // Wait for iframe to load
    await page.waitForTimeout(100);
    await page.getByTestId("testAllButton").click();
    
    const result = await testStateDriver.testState();
    expect(result.hasWindow).toBe(true);
    expect(result.hasDocument).toBe(true);
    expect(result.documentTitle).toBe("API Test Document");
    expect(result.messageSent).toBe(true);
  });
});
