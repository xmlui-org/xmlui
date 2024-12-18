import { expect, ComponentDriver, createTestWithDriver } from "@testing/fixtures";

// --- Setup

class MarkdownDriver extends ComponentDriver {
  // TODO: methods to handle text node content and applied styles
}

const test = createTestWithDriver(MarkdownDriver);

// --- Testing

test.skip("only renders if children are strings", async ({ createDriver }) => {});

test.skip("renders if children are provided through CDATA", async ({ createDriver }) => {});

test.skip("renders body text", async ({ createDriver }) => {});

test.skip("renders strong text", async ({ createDriver }) => {});

test.skip("renders emphasis text", async ({ createDriver }) => {});

test.skip("renders heading", async ({ createDriver }) => {});

test.skip("renders link", async ({ createDriver }) => {});

test.skip("renders image", async ({ createDriver }) => {});

test.skip("renders unordered list", async ({ createDriver }) => {});

test.skip("renders ordered list", async ({ createDriver }) => {});

test.skip("renders inline code", async ({ createDriver }) => {});

test.skip("renders code block", async ({ createDriver }) => {});

test.skip("renders table", async ({ createDriver }) => {});

test.skip("renders blockquote", async ({ createDriver }) => {});

test.skip("renders horizontal rule", async ({ createDriver }) => {});
