import { orderingValues, scrollAnchoringValues } from "../abstractions";
import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// --- data & items

test.skip(
  "array of objects comprise data: List renders correctly",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "array of primitives comprise data: List renders correctly",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "throw error if data is not array",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- $item

test.skip(
  "$item provides access to each item",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- itemTemplate

test.skip(
  "itemTemplate renders correct components",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- loading

test.skip(
  "loading state is shown if property is true & data is undefined",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "loading state is not shown if property is true & data is defined",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "loading state is not shown but empty list is if property is true & data is undefined",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- limit

test.skip(
  "number of items does not exceed limit property",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- scrollAnchor

scrollAnchoringValues.forEach((anchor) => {
  test.skip(
    `scrollAnchor scrolls to ${anchor}`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

// --- --- pageInfo

test.skip(
  "setting pageInfo adds pagination",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "no pageInfo disables pagination",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- groupBy

test.skip(
  "groupBy defines grouping by attribute",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "no grouping if groupBy set to nonexistent attribute",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- orderBy

orderingValues.forEach((order) => {
  test.skip(
    `orderBy on field sorts by ${order}`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    `mulitple fields with orderBy sorts by ${order} and other order`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {
      // Use ${order} for the first field and any other order value for the second
    },
  );
});

// --- --- availableGroups

test.skip(
  "all groups defined in availableGroups will be rendered",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "no further groups are rendered other than ones in availableGroups",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- groupHeaderTemplate

test.skip(
  "render custom group header",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- groupFooterTemplate

test.skip(
  "render custom group footer",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- emptyListTemplate

test.skip(
  "show default empty list display if list is empty",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "render emptyListTemplate on empty list",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- idKey

test.skip(
  "idKey specifies ID of each item",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "idKey set to nonexistent attribute renders nothing",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- borderCollapse

test.skip(
  "borderCollapse applies collapsed border style",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- selectedIndex

test.skip(
  "selectedIndex scrolls to item",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "selectedIndex to nonexistent index does nothing",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- groupsInitiallyExpanded

test.skip(
  "groupsInitiallyExpanded expands all groups on first render",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- defaultGroups

test.skip(
  "defaultGroups creates groups by default",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "defaultGroups preserves the order of groups",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "other groups in data are rendered after default groups ",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "unordered other groups in data are after default groups ",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- hideEmptyGroups

test.skip(
  "hideEmptyGroups hides empty groups",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- Further tests

test.skip(
  "List handles preset height",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "runtime resetting of height is handled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
