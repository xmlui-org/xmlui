/**
 * Tests here should focus on the dimensions of the Splitter,
 * as well as on children rendering properly and not getting cut or do not overflow their container.
 * Edge cases, like the splitter being too small to be visible are also subject to be tested.
 */

import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

test.skip(
  "Splitter renders & is visible",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- orientation

test.skip(
  "orientation=horizontal renders primary and secondary from left to right",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "orientation=vertical renders primary and secondary from top to bottom",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- swapped

[
  { swapped: false, orientation: "horizontal", what: "primary and secondary from left to right" },
  { swapped: true, orientation: "horizontal", what: "secondary and primary from left to right" },
  { swapped: false, orientation: "vertical", what: "primary and secondary from top to bottom" },
  { swapped: true, orientation: "vertical", what: "secondary and primary from top to bottom" },
].forEach(({ swapped, orientation, what }) => {
  test.skip(
    `swapped=${swapped} & orientation=${orientation} renders ${what}`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
})

// --- splitterTemplate

test.skip(
  "splitterTemplate renders correctly",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- initialPrimarySize

test.skip(
  "initialPrimarySize sets the initial size of the primary section",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- minPrimarySize

test.skip(
  "minPrimarySize sets the minimum size of the primary section",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "if initialPrimarySize < minPrimarySize then initial primary size is set to minPrimarySize",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- maxPrimarySize

test.skip(
  "maxPrimarySize sets the maximum size of the primary section",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "if initialPrimarySize < maxPrimarySize then initial primary size is set to maxPrimarySize",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- floating

test.skip(
  "floating=false shows resizer handle only on hover",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "floating=true shows resizer handle all the time",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- enabled

test.skip(
  "enabled=true enables the component",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "enabled=false disables the component",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- onResize

test.skip(
  "onResize is called when splitter is resized",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "onResize is not called when splitter is disabled & resized",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
