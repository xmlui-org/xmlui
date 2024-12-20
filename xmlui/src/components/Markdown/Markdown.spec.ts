import { SKIP_REASON } from "@testing/component-test-helpers";
import { expect, ComponentDriver, createTestWithDriver } from "@testing/fixtures";

// --- Setup

class MarkdownDriver extends ComponentDriver {
  // TODO: methods to handle text node content and applied styles
}

const test = createTestWithDriver(MarkdownDriver);

// --- Testing

test.skip("only renders if children are strings",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders if children are provided through CDATA",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders body text",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders strong text",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders emphasis text",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders heading",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders link",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders image",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders unordered list",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders ordered list",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders inline code",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders code block",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders table",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders blockquote",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("renders horizontal rule",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});
