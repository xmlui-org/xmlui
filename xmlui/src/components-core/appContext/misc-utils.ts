import { capitalize, defaultTo } from "lodash-es";

import { debounce, distinct, findByField, pluralize, toHashObject } from "../utils/misc";

export const miscellaneousUtils = {
  capitalize,
  pluralize,
  defaultTo,
  toHashObject,
  findByField,
  distinct,
  debounce
};
