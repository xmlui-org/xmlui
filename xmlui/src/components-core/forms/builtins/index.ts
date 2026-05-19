/**
 * Built-in validator barrel (Plan #9 Step 1.1).
 *
 * This file exposes a concrete registration function rather than relying
 * on side-effect imports, so production tree-shaking keeps the built-ins
 * when the forms barrel is imported. Apps can override any of them by calling
 * `App.registerValidator()` with the same name later — duplicate
 * registration emits `duplicate-validator` (warn) but proceeds.
 */

import { registerValidator } from "../validator-registry";
import { creditCardValidator } from "./creditCard";
import { emailValidator } from "./email";
import { ibanValidator } from "./iban";
import { isoDateValidator } from "./isoDate";
import { lengthValidator } from "./length";
import { noLeadingTrailingWhitespaceValidator } from "./noLeadingTrailingWhitespace";
import { phoneValidator } from "./phone";
import { strongPasswordValidator } from "./strongPassword";
import { urlValidator } from "./url";

const builtInValidators = [
  emailValidator,
  phoneValidator,
  urlValidator,
  creditCardValidator,
  ibanValidator,
  isoDateValidator,
  strongPasswordValidator,
  noLeadingTrailingWhitespaceValidator,
  lengthValidator,
];

let registered = false;

export function registerBuiltInValidators(): void {
  if (registered) return;
  registered = true;
  builtInValidators.forEach(registerValidator);
}
